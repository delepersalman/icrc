export const AttendeeAction = {
    RoleChange: 'role-change',
    AttendeeInfo: 'attendee-info',
    BlockUser: 'block-user',
    UnBlockUser: 'unblock-user',
    InviteMember: 'invite-user',
    OpenChat: 'open-chat'
}

export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}