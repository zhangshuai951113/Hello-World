package com.xz.logistics.shiro.common.tags;

/**
 * <p>Equivalent to {@link org.apache.shiro.web.tags.HasRoleTag}</p>
 */
public class HasRoleTag extends RoleTag {
    protected boolean showTagBody(String roleName) {
        return getSubject() != null && getSubject().hasRole(roleName);
    }
}
