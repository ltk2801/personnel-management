import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nêu truyền @GetUser('id') , nó sẽ chỉ trả về id của user
    return data ? user?.[data] : user;
  },
);
