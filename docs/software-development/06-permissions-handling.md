### RBAC (handling permissions)

<iframe width="560" height="315" src="https://www.youtube.com/embed/5GG-VUvruzE?si=Rx3a2rGxMT4CSuuJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

#### RBAC implementation

**Concept:** Instead of checking _roles_ inside components, you check _permissions_. You define a central configuration that maps Roles to Permissions (e.g., "delete:comments").

**The Benefit:** Your components became cleaner. They just ask "Can I delete comments?". They don't care _who_ the user is.

**The Limitation:** It struggles with ownership. A standard RBAC system says "Users can delete comments," but it can't easily say "Users can delete _their own_ comments." This limitation arises because a RBAC system doesn't take into account the **resources** a user owns.

```ts
// ✅ permissions.ts
const ROLES = {
  admin: ["view:comments", "create:comments", "delete:comments"],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments"],
} as const;

export function hasPermission(user, permission) {
  return ROLES[user.role].includes(permission);
}

// Usage in Component
// Clean, but lacks "ownership" checks
const canDelete = hasPermission(user, "delete:comments");
```

#### Attribute-Based Access Control (ABAC)

**Concept:** To handle complex rules (e.g., "You can delete a comment IF you own it OR if you are an admin"), you need a system that looks at the **User**, the **Action**, and the **Resource** (the specific data object).

```ts
// ✅ permissions.ts
type User = { id: string; role: 'admin' | 'user' };
type Comment = { authorId: string; blockedBy?: string[] };

const PERMISSIONS = {
  comments: {
    // Admin can do anything; Users can only view if not blocked
    view: (user: User, comment: Comment) => {
      return user.role === 'admin' || !comment.blockedBy?.includes(user.id);
    },
    
    // Admin can delete anything; Users can delete ONLY if they are the author
    delete: (user: User, comment: Comment) => {
      if (user.role === 'admin') return true;
      return user.id === comment.authorId;
    }
  },
  todos: {
    // defined similar rules for other resources...
  }
};

// ✅ lib/auth.ts
export function hasPermission(user, resource, action, data?) {
  const resourcePermissions = PERMISSIONS[resource];
  if (!resourcePermissions) return false;

  const permissionChecker = resourcePermissions[action];
  if (!permissionChecker) return false;

  return permissionChecker(user, data);
}
```

