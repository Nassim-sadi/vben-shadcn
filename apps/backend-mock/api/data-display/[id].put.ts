import { eventHandler, getRouterParam, readBody } from 'h3';
import { updateDataDisplayItem } from '~/utils/data-display-utils';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  sleep,
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = getRouterParam(event, 'id');
  if (!id) {
    return useResponseError('id is required');
  }

  const body = await readBody(event);
  await sleep(200);

  const updated = updateDataDisplayItem(id, {
    category: body.category,
    code: body.code,
    completedQuantity:
      body.completedQuantity === undefined
        ? undefined
        : Number(body.completedQuantity),
    line: body.line,
    name: body.name,
    operator: body.operator,
    planQuantity:
      body.planQuantity === undefined ? undefined : Number(body.planQuantity),
    priority: body.priority,
    remark: body.remark,
    status:
      body.status === undefined ? undefined : (Number(body.status) as any),
  });

  if (!updated) {
    return useResponseError('Data display item not found');
  }

  return useResponseSuccess(updated);
});
