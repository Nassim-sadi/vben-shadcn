import { eventHandler, getQuery } from 'h3';
import { getDataDisplayList } from '~/utils/data-display-utils';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { firstQueryInt, firstQueryString } from '~/utils/query';
import {
  sleep,
  unAuthorizedResponse,
  usePageResponseSuccess,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  await sleep(150);

  const query = getQuery(event);
  const page = Math.max(1, firstQueryInt(query.page, 1));
  const pageSize = Math.min(
    100,
    Math.max(1, firstQueryInt(query.pageSize, 10)),
  );

  const filteredList = getDataDisplayList({
    category: firstQueryString(query.category),
    code: firstQueryString(query.code),
    endTime: firstQueryString(query.endTime),
    line: firstQueryString(query.line),
    name: firstQueryString(query.name),
    sortBy: firstQueryString(query.sortBy),
    sortOrder: firstQueryString(query.sortOrder),
    startTime: firstQueryString(query.startTime),
    status: firstQueryString(query.status),
  });

  return usePageResponseSuccess(page, pageSize, filteredList);
});
