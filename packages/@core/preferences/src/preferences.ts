import type { DeepPartial } from '@vben-core/typings';

import type {
  CustomPreferencesField,
  CustomPreferencesRecord,
  InitialOptions,
  Preferences,
  PreferencesExtension,
} from './types';

import { markRaw, reactive, readonly, watch } from 'vue';

import { MemoryStorageDriver, StorageManager } from '@vben-core/shared/cache';
import { isMacOs, merge, mergeWithArrayOverride } from '@vben-core/shared/utils';

import { breakpointsTailwind, useBreakpoints, useDebounceFn } from '@vueuse/core';

import { defaultPreferences } from './config';
import { updateCSSVariables } from './update-css-variables';

const STORAGE_KEYS = {
  CUSTOM: 'preferences-custom',
  MAIN: 'preferences',
  LOCALE: 'preferences-locale',
  THEME: 'preferences-theme',
} as const;

class PreferenceManager {
  private cache: StorageManager;
  private customPreferencesExtension: null | PreferencesExtension<any> = null;
  private customState = reactive<CustomPreferencesRecord>({});
  private debouncedSave: () => void;
  private initialCustomPreferences: CustomPreferencesRecord = {};
  private initialPreferences: Preferences = defaultPreferences;
  private isInitialized = false;
  private state: Preferences;

  constructor() {
    this.cache = new StorageManager({ driver: new MemoryStorageDriver() });
    // The constructor no longer reads the cache synchronously and initializes it with default values
    // The real cache loading is done in initPreferences (already async)
    this.state = reactive<Preferences>({ ...defaultPreferences });
    this.debouncedSave = useDebounceFn(() => this.saveToCache(), 150);
  }

  /**
   * Clear all cached preferences
   */
  clearCache = async () => {
    await Promise.all(Object.values(STORAGE_KEYS).map((key) => this.cache.removeItem(key)));
  };

  /**
   * Get extended preferences
   */
  getCustomPreferences = <TCustomPreferences extends object = CustomPreferencesRecord>() => {
    return readonly(this.customState) as Readonly<TCustomPreferences>;
  };

  /**
   * Get initialization extension preferences
   */
  getInitialCustomPreferences = <TCustomPreferences extends object = CustomPreferencesRecord>() => {
    return this.cloneValue(this.initialCustomPreferences) as Readonly<TCustomPreferences>;
  };

  /**
   * Get initialization preferences
   */
  getInitialPreferences = () => {
    return this.initialPreferences;
  };

  /**
   * Get current preferences (read-only)
   */
  getPreferences = () => {
    return readonly(this.state);
  };

  /**
   * Get extended preference configuration
   */
  getPreferencesExtension = <TCustomPreferences extends object = CustomPreferencesRecord>() => {
    return this.customPreferencesExtension
      ? (this.cloneValue(this.customPreferencesExtension) as Readonly<
          PreferencesExtension<TCustomPreferences>
        >)
      : null;
  };

  /**
   * Initialize preferences
   * @param options -Initialize configuration items
   * @param options.namespace -Namespace, used to isolate the configuration of different applications
   * @param options.overrides -Preferences to override
   */
  initPreferences = async <TCustomPreferences extends object = CustomPreferencesRecord>({
    namespace,
    overrides,
    extension,
  }: InitialOptions<TCustomPreferences>) => {
    // Prevent repeated initialization
    if (this.isInitialized) {
      return;
    }

    // Initialize storage manager using namespace
    this.cache = new StorageManager({ prefix: namespace });

    // Merge initial preferences: earlier objects take precedence, later objects only fill in missing fields
    this.initialPreferences = merge({}, overrides, defaultPreferences);
    this.customPreferencesExtension = extension ?? null;
    this.initialCustomPreferences = this.resolveCustomPreferencesDefaults(
      this.customPreferencesExtension,
    );

    // Loads the cached preferences and only uses the cache to complete fields not explicitly set in the initialization configuration
    const cachedPreferences = (await this.loadFromCache()) || {};
    // Fix historical dirty data: earlier versions used defu(merge) to merge arrays, resulting in widget.order
    // It is appended by concat every time updatePreferences is updated, and expands to dozens/hundreds of duplicate keys.
    // Here, deduplication is done after loading the cache, and the key that appears for the first time is retained.
    this.sanitizeCachedArray(cachedPreferences, 'widget', 'order');
    const mergedPreference = mergeWithArrayOverride(
      {},
      cachedPreferences, // User cache settings take precedence
      this.initialPreferences, // The initial setup only fills in missing fields
    );

    // Update preferences
    this.updatePreferences(mergedPreference);

    const cachedCustom = (await this.loadCustomFromCache()) || {};
    this.replaceCustomPreferences(
      mergeWithArrayOverride(
        {},
        this.sanitizeCustomPreferences(cachedCustom),
        this.initialCustomPreferences,
      ),
    );
    await this.saveToCache();

    // Set up listener
    this.setupWatcher();

    // Initialize platform identification
    this.initPlatform();

    this.isInitialized = true;
  };

  /**
   * Reset preferences to initial state
   */
  resetPreferences = async () => {
    // Reset state to initial preferences
    Object.assign(this.state, this.initialPreferences);
    this.replaceCustomPreferences(this.initialCustomPreferences);

    // Directly trigger UI updates
    this.handleUpdates(this.state);

    // Save preferences to cache
    await this.saveToCache();
  };

  /**
   * Update extension preferences
   * @param updates -Extension preferences to update
   */
  updateCustomPreferences = <TCustomPreferences extends object = CustomPreferencesRecord>(
    updates: DeepPartial<TCustomPreferences>,
  ) => {
    if (!this.customPreferencesExtension) {
      return;
    }

    const sanitizedUpdates = this.sanitizeCustomPreferences(updates);

    if (Object.keys(sanitizedUpdates).length === 0) {
      return;
    }

    this.replaceCustomPreferences(
      mergeWithArrayOverride({}, sanitizedUpdates, markRaw(this.customState)),
    );
    this.debouncedSave();
  };

  /**
   * Update preferences
   * @param updates -Preferences to update
   */
  updatePreferences = (updates: DeepPartial<Preferences>) => {
    // Deeply merge updated content and current status
    // Note: mergeWithArrayOverride must be used instead of merge.
    // The semantics of defu(merge) for the array is concat append, which will cause widget.order, etc.
    // Array fields are appended repeatedly every time updatePreferences is called, expanding exponentially.
    const mergedState = mergeWithArrayOverride({}, updates, markRaw(this.state));
    Object.assign(this.state, mergedState);

    // Perform an update based on the updated value
    this.handleUpdates(updates);

    // Save to cache (fire-and-forget, control frequency via debounce)
    this.debouncedSave();
  };

  private cloneValue<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((item) => this.cloneValue(item)) as T;
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
          key,
          this.cloneValue(nestedValue),
        ]),
      ) as T;
    }

    return value;
  }

  /**
   * Handle updates
   * @param updates -Updated preferences
   */
  private handleUpdates(updates: DeepPartial<Preferences>) {
    const { theme, app } = updates;

    if (theme && (Object.keys(theme).length > 0 || Reflect.has(theme, 'fontSize'))) {
      updateCSSVariables(this.state);
    }

    if (app && (Reflect.has(app, 'colorGrayMode') || Reflect.has(app, 'colorWeakMode'))) {
      this.updateColorMode(this.state);
    }
  }

  /**
   * Initialize platform identification
   */
  private initPlatform() {
    document.documentElement.dataset.platform = isMacOs() ? 'macOs' : 'window';
  }

  private isAlmostInteger(value: number, epsilon = Number.EPSILON * 10) {
    return Math.abs(value - Math.round(value)) < epsilon;
  }

  private isValidCustomPreferenceValue(field: CustomPreferencesField, value: unknown) {
    switch (field.component) {
      case 'number': {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return false;
        }

        const max = this.resolveNumericConstraint(field.componentProps?.max);
        const min = this.resolveNumericConstraint(field.componentProps?.min);
        const step = this.resolveNumericConstraint(field.componentProps?.step);

        if (min !== undefined && value < min) {
          return false;
        }

        if (max !== undefined && value > max) {
          return false;
        }

        if (step !== undefined) {
          if (step <= 0) {
            return false;
          }

          const stepBase = min ?? 0;
          const stepCount = (value - stepBase) / step;

          if (!this.isAlmostInteger(stepCount)) {
            return false;
          }
        }

        return true;
      }
      case 'select': {
        return typeof value === 'string' && field.options.some((option) => option.value === value);
      }
      case 'switch': {
        return typeof value === 'boolean';
      }
      default: {
        return typeof value === 'string';
      }
    }
  }

  /**
   * Load extension preferences from cache
   * @returns The cached extension preference, or null if it does not exist
   */
  private async loadCustomFromCache(): Promise<CustomPreferencesRecord | null> {
    return this.cache.getItem<CustomPreferencesRecord>(STORAGE_KEYS.CUSTOM);
  }

  /**
   * Load preferences from cache
   * @returns The cached preference, or null if it does not exist
   */
  private async loadFromCache(): Promise<null | Preferences> {
    return this.cache.getItem<Preferences>(STORAGE_KEYS.MAIN);
  }

  private replaceCustomPreferences(preferences: CustomPreferencesRecord) {
    Object.keys(this.customState).forEach((key) => {
      Reflect.deleteProperty(this.customState, key);
    });
    Object.assign(this.customState, preferences);
  }

  private resolveCustomPreferencesDefaults(extension: null | PreferencesExtension<any>) {
    if (!extension) {
      return {};
    }

    const result: CustomPreferencesRecord = {};

    for (const field of extension.fields) {
      result[field.key] = field.defaultValue;
    }

    return result;
  }

  private resolveNumericConstraint(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  /**
   * Clean bloated array fields in cache (keep first occurrence of element)
   * Used to fix dirty data caused by concat append when merging arrays in earlier versions of defu
   */
  private sanitizeCachedArray(cached: Record<string, any>, group: string, field: string) {
    const node = cached?.[group]?.[field];
    if (!Array.isArray(node) || node.length <= 1) return;
    const seen = new Set<unknown>();
    const deduped = node.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
    if (deduped.length !== node.length) {
      cached[group][field] = deduped;
    }
  }

  private sanitizeCustomPreferences(updates: DeepPartial<CustomPreferencesRecord>) {
    if (!this.customPreferencesExtension) {
      return {};
    }

    const result: CustomPreferencesRecord = {};

    for (const field of this.customPreferencesExtension.fields) {
      const value = updates[field.key];

      if (value !== undefined && this.isValidCustomPreferenceValue(field, value)) {
        result[field.key] = value;
      }
    }

    return result;
  }

  /**
   * Save preferences to cache
   */
  private async saveToCache() {
    try {
      await this.cache.setItem(STORAGE_KEYS.MAIN, this.state);
      await this.cache.setItem(STORAGE_KEYS.LOCALE, this.state.app.locale);
      await this.cache.setItem(STORAGE_KEYS.THEME, this.state.theme.mode);

      if (this.customPreferencesExtension) {
        await this.cache.setItem(STORAGE_KEYS.CUSTOM, {
          ...this.customState,
        });
        return;
      }

      await this.cache.removeItem(STORAGE_KEYS.CUSTOM);
    } catch (error) {
      console.error('Failed to save preferences to cache:', error);
    }
  }

  /**
   * Listen for changes in state and system preferences
   */
  private setupWatcher() {
    if (this.isInitialized) {
      return;
    }

    // Monitor breakpoints to determine whether the mobile terminal is
    const breakpoints = useBreakpoints(breakpointsTailwind);
    const isMobile = breakpoints.smaller('md');

    watch(
      () => isMobile.value,
      (val) => {
        this.updatePreferences({
          app: { isMobile: val },
        });
      },
      { immediate: true },
    );

    // Listen for system theme preference changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', ({ matches: isDark }) => {
        // Follow system themes only in automatic mode
        if (this.state.theme.mode === 'auto') {
          // Apply the actual theme first
          this.updatePreferences({
            theme: { mode: isDark ? 'dark' : 'light' },
          });
          // Then return to auto mode and keep following the system.
          this.updatePreferences({
            theme: { mode: 'auto' },
          });
        }
      });
  }

  /**
   * Update page color mode (grey, color weak)
   * @param preference -Preferences
   */
  private updateColorMode(preference: Preferences) {
    const { colorGrayMode, colorWeakMode } = preference.app;
    const dom = document.documentElement;

    dom.classList.toggle('invert-mode', colorWeakMode);
    dom.classList.toggle('grayscale-mode', colorGrayMode);
  }
}

const preferencesManager = new PreferenceManager();

export { PreferenceManager, preferencesManager };
