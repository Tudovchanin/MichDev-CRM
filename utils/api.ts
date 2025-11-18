

type EntityType = "boards" | "tasks" | "profile"; //path

export function getApiPathForUser(
  entity: EntityType,
  currentUserRole?: string,
  targetUserId?: string
) {
  // Если роль не передана или работаем с самим собой / клиентом / исполнителем
  if (!currentUserRole || !targetUserId || currentUserRole === "CLIENT" || currentUserRole === "EXECUTOR") {
    return `/api/v1/me/${entity}`;
  }

  // Для менеджера или админа, когда targetUserId указан
  return `/api/v1/users/${targetUserId}/${entity}`;
}

// const path = getApiPathForUser("boards", currentUser.role, targetUser.id);
// const response = await fetch(path);
// const boards = await response.json();