import type {
  VbenFormProps as FormProps,
  VbenFormSchema as FormSchema,
  FormValues,
} from '@vben/common-ui';

import type { ComponentPropsMap, ComponentType } from './component';

import { setupVbenForm, useVbenForm as useForm, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

async function initSetupVbenForm() {
  setupVbenForm<ComponentType>({
    config: {
      // shadcn components use v-model:modelValue uniformly
      baseModelPropName: 'modelValue',
    },
    rules: {
      // International adaptation is required for input items
      required: (value, _params, ctx) => {
        if (value === undefined || value === null || value.length === 0) {
          return $t('ui.formRules.required', [ctx.label]);
        }
        return true;
      },
      // International adaptation is required when selecting a project
      selectRequired: (value, _params, ctx) => {
        if (value === undefined || value === null) {
          return $t('ui.formRules.selectRequired', [ctx.label]);
        }
        return true;
      },
    },
  });
}

function useVbenForm<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
>(
  options: FormProps<
    ComponentType,
    ComponentPropsMap,
    TFormValues,
    TSubmitValues
  >,
) {
  return useForm<TFormValues, ComponentType, ComponentPropsMap, TSubmitValues>(
    options,
  );
}

export { initSetupVbenForm, useVbenForm, z };

export type VbenFormSchema<TValues extends FormValues = FormValues> =
  FormSchema<ComponentType, ComponentPropsMap, TValues>;
export type VbenFormProps<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
> = FormProps<ComponentType, ComponentPropsMap, TFormValues, TSubmitValues>;
