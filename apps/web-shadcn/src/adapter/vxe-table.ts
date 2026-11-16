import type { FormValues, TableActionProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentPropsMap, ComponentType } from './component';

import { defineComponent, h } from 'vue';

import { useAccess } from '@vben/access';
import { VbenTableAction as VbenTableActionCore } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { useDictStore } from '@vben/stores';
import { get, isFunction, isString } from '@vben/utils';

import { useTableColumnWidths } from './vxe-table/use-column-widths';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Switch,
} from '@vben-core/shadcn-ui';

import { objectOmit } from '@vueuse/core';

import { AlertConfirm, Tag } from '#/components/ui/app';
import { $t } from '#/locales';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },

        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        minHeight: 180,
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: '',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    /**
     * 解决vxeTable在热更新时可能会出错的问题
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 单元格渲染：状态标签
    // 表格配置项可用 cellRender: { name: 'CellTag', options: [...] }
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = (options ?? [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 0 },
        ]) as Array<Recordable<any>>;
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          Tag,
          {
            color:
              tagItem?.color ?? (props as Recordable<any> | undefined)?.color,
          },
          { default: () => tagItem?.label ?? String(value ?? '') },
        );
      },
    });

    // 单元格渲染：字典标签
    // 表格配置项可用 cellRender: { name: 'CellDict', props: { code: 'user_gender' } }
    vxeUI.renderer.add('CellDict', {
      renderTableDefault({ props }, { column, row }) {
        const code = (props as Recordable<any> | undefined)?.code as
          | string
          | undefined;
        const value = get(row, column.field);
        if (!code) {
          return value;
        }
        const dictStore = useDictStore();
        const item = dictStore.getDictItem(code, value);
        if (!item) {
          return value;
        }
        return h(Tag, { color: item.color }, { default: () => item.label });
      },
    });

    // 单元格渲染：开关（带更新前确认）
    // 表格配置项可用 cellRender: { name: 'CellSwitch', attrs: { beforeChange } }
    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const checkedValue =
          (props as Recordable<any> | undefined)?.checkedValue ?? 1;
        const unCheckedValue =
          (props as Recordable<any> | undefined)?.unCheckedValue ?? 0;
        async function onChange(checked: boolean) {
          const newVal = checked ? checkedValue : unCheckedValue;
          const result = await (
            attrs as Recordable<any> | undefined
          )?.beforeChange?.(newVal, row);
          if (result !== false) {
            row[column.field] = newVal;
          }
        }
        return h(Switch, {
          'onUpdate:modelValue': onChange,
          disabled:
            (props as Recordable<any> | undefined)?.disabled || undefined,
          modelValue: row[column.field] === checkedValue,
        });
      },
    });

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props: rawProps }, { column, row }) {
        const {
          menuButtonPosition = 'right',
          menuCodes = [],
          menuIcon,
          menuText = $t('common.more'),
          mode,
          renderMode,
          ...props
        } = rawProps ?? {};
        const defaultProps = { size: 'sm', variant: 'link', ...props };
        let align: string;
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: {
            variant: 'link',
            text: $t('common.delete'),
          },
          edit: {
            text: $t('common.edit'),
          },
          detail: {
            text: $t('common.detail'),
          },
        };
        const operations: Array<Recordable<any>> = (
          options || ['edit', 'detail', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                    code: opt,
                    text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                    ...defaultProps,
                  };
            } else {
              return { ...defaultProps, ...presets[opt.code], ...opt };
            }
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        /** 去除业务字段，避免以 HTML attribute 形式渲染到 DOM */
        function toButtonProps(opt: Recordable<any>) {
          return objectOmit(opt ?? {}, [
            'auth',
            'code',
            'icon',
            'name',
            'popConfirm',
            'show',
            'text',
            'variant',
          ]);
        }

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            Button,
            {
              size: defaultProps.size as any,
              variant: opt.variant ?? 'link',
              ...toButtonProps(opt),
              onClick: listen
                ? () =>
                    (attrs as Recordable<any> | undefined)?.onClick?.({
                      code: opt.code,
                      row,
                    })
                : undefined,
            },
            {
              default: () => {
                const content = [];
                if (opt.icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-4', icon: opt.icon }),
                  );
                }
                if (opt.text) {
                  content.push(h('span', opt.text));
                }
                return content;
              },
            },
          );
        }

        function renderConfirm(opt: Recordable<any>) {
          return h(
            AlertConfirm,
            {
              cancelText: $t('common.cancel'),
              description: $t('ui.actionMessage.deleteConfirm', [
                row[
                  (attrs as Recordable<any> | undefined)?.nameField || 'name'
                ],
              ]),
              okText: $t('common.confirm'),
              title: $t('ui.actionTitle.delete', [
                (attrs as Recordable<any> | undefined)?.nameTitle || '',
              ]),
              onConfirm: () => {
                (attrs as Recordable<any> | undefined)?.onClick?.({
                  code: opt.code,
                  row,
                });
              },
            },
            { default: () => renderBtn({ ...opt }, false) },
          );
        }

        const renderOperation = (opt: Recordable<any>) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt);
        const btns = operations.map((operation) => renderOperation(operation));

        function renderMenuTrigger() {
          return h(
            Button,
            {
              size: defaultProps.size as any,
              variant: 'link',
            },
            {
              default: () => {
                const content = [];
                if (menuIcon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-4', icon: menuIcon }),
                  );
                }
                if (menuText) {
                  content.push(h('span', menuText));
                }
                return h(
                  'div',
                  { class: 'inline-flex items-center gap-1 leading-none' },
                  content,
                );
              },
            },
          );
        }

        const operationRenderStrategies = {
          button: () => btns,
          menu: () => {
            // 未配置 menuCodes 时，renderMode=menu 仍然将全部操作收入下拉菜单。
            const hasMenuCodes =
              Array.isArray(menuCodes) && menuCodes.length > 0;
            const menuCodeSet = new Set(menuCodes);
            const inlineBtns = hasMenuCodes
              ? operations
                  .filter((opt) => !menuCodeSet.has(opt.code))
                  .map((operation) => renderOperation(operation))
              : [];
            const menuBtns = hasMenuCodes
              ? operations.filter((opt) => menuCodeSet.has(opt.code))
              : operations;
            const dropdownBtn =
              menuBtns.length > 0
                ? [
                    h(
                      DropdownMenu,
                      {},
                      {
                        default: () => [
                          h(
                            DropdownMenuTrigger as any,
                            { class: 'cursor-pointer outline-none' },
                            { default: () => renderMenuTrigger() },
                          ),
                          h(
                            DropdownMenuContent,
                            {
                              align: column.align === 'left' ? 'start' : 'end',
                              class: 'flex min-w-20 flex-col gap-1 p-1',
                            },
                            {
                              default: () =>
                                menuBtns.map((menuOpt) =>
                                  h(
                                    'div',
                                    {
                                      class:
                                        'flex w-full min-w-20 justify-center [&_button]:w-full [&_button]:justify-center',
                                      key: menuOpt.code,
                                      onClick: (event: MouseEvent) =>
                                        event.stopPropagation(),
                                    },
                                    [renderOperation(menuOpt)],
                                  ),
                                ),
                            },
                          ),
                        ],
                      },
                    ),
                  ]
                : [];

            return hasMenuCodes && menuButtonPosition === 'left'
              ? [...dropdownBtn, ...inlineBtns]
              : [...inlineBtns, ...dropdownBtn];
          },
        };
        const renderOperations =
          (renderMode ?? mode) === 'menu'
            ? operationRenderStrategies.menu
            : operationRenderStrategies.button;

        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          renderOperations(),
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
});

export const useVbenVxeGrid = <
  T extends Record<string, any>,
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
>(
  ...rest: Parameters<
    typeof useGrid<
      T,
      ComponentType,
      ComponentPropsMap,
      TFormValues,
      TSubmitValues
    >
  >
) => {
  const options = rest[0] as Parameters<
    typeof useGrid<
      T,
      ComponentType,
      ComponentPropsMap,
      TFormValues,
      TSubmitValues
    >
  >[0];

  const columnWidths = useTableColumnWidths();

  if (options) {
    if (options.gridOptions) {
      const gridOptions = options.gridOptions;
      if (Array.isArray(gridOptions.columns)) {
        const persisted = columnWidths.applySavedWidths(
          gridOptions.columns as any,
        );
        (gridOptions as any).columns = persisted;
      }
    }
    options.gridEvents = {
      ...options.gridEvents,
      resizableChange: columnWidths.handleResize,
    };
  }

  return useGrid<T, ComponentType, ComponentPropsMap, TFormValues, TSubmitValues>(
    ...rest,
  );
};

/**
 * 表格操作按钮组件
 *
 * 在适配器内部统一注入权限判断（hasPermission），使用方无需再传入 `:has-permission`。
 * 通过 action 的 `auth` 字段声明权限码，结合 `useAccess().hasAccessByCodes` 判断是否展示。
 * 如需自定义权限逻辑，仍可显式传入 `:has-permission` 覆盖默认行为。
 */
export const VbenTableAction = defineComponent(
  (props: TableActionProps, { attrs, slots }) => {
    const { hasAccessByCodes } = useAccess();
    function hasPermission(auth?: string | string[]) {
      if (!auth) return true;
      return hasAccessByCodes(Array.isArray(auth) ? auth : [auth]);
    }
    return () =>
      h(VbenTableActionCore, { hasPermission, ...props, ...attrs }, slots);
  },
  {
    name: 'VbenTableAction',
    inheritAttrs: false,
  },
);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;
export { useTableColumnWidths } from './vxe-table/use-column-widths';
export type * from '@vben/plugins/vxe-table';
