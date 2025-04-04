export const UserRolesEnum = {
    ADMIN: "admin",
    PROJRCT_ADMIN: 'project-admin',
    MEMBER: 'member'
}

export const AvialableUserRoles = Object.values(UserRolesEnum)

export const TaskStatusEnum = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done'
}
export const AvialableTaskStatuses = Object.values(TaskStatusEnum)
