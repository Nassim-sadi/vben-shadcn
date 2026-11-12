import { eventHandler, readBody } from 'h3';
import { createDataDisplayItem } from '~/utils/data-display-utils';
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

  const body = await readBody(event);
  if (!body?.code || !body?.name) {
    return useResponseError('code and name are required');
  }

  await sleep(200);

  const item = createDataDisplayItem({
    category: body.category || 'electronics',
    code: body.code,
    completedQuantity: Number(body.completedQuantity) || 0,
    line: body.line || 'Line-A',
    name: body.name,
    operator: body.operator || userinfo.username,
    planQuantity: Number(body.planQuantity) || 100,
    priority: body.priority || 'medium',
    remark: body.remark || '',
    status: (Number(body.status) >= 0 && Number(body.status) <= 3
      ? Number(body.status)
      : 0) as 0 | 1 | 2 | 3,
  });

  return useResponseSuccess(item);
});
