import { eventHandler, getRouterParam } from 'h3';
import { deleteDataDisplayItem } from '~/utils/data-display-utils';
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

  await sleep(150);

  if (!deleteDataDisplayItem(id)) {
    return useResponseError('Data display item not found');
  }

  return useResponseSuccess(null);
});
