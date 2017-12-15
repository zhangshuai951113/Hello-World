package com.xz.logistics.shiro.common;

import freemarker.template.TemplateException;

import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

import com.xz.logistics.shiro.common.tags.AuthenticatedTag;
import com.xz.logistics.shiro.common.tags.GuestTag;
import com.xz.logistics.shiro.common.tags.HasAnyRolesTag;
import com.xz.logistics.shiro.common.tags.HasPermissionTag;
import com.xz.logistics.shiro.common.tags.HasRoleTag;
import com.xz.logistics.shiro.common.tags.LacksPermissionTag;
import com.xz.logistics.shiro.common.tags.LacksRoleTag;
import com.xz.logistics.shiro.common.tags.NotAuthenticatedTag;
import com.xz.logistics.shiro.common.tags.PrincipalTag;
import com.xz.logistics.shiro.common.tags.ShiroTags;
import com.xz.logistics.shiro.common.tags.UserTag;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ShiroTagFreeMarkerConfigurer extends FreeMarkerConfigurer {
    @Override
    public void afterPropertiesSet() throws IOException, TemplateException {
        Map<String, Object> tagsMap = new HashMap<String,Object>();
        tagsMap.put("authenticated", new AuthenticatedTag());
        tagsMap.put("guest", new GuestTag());
        tagsMap.put("hasAnyRoles", new HasAnyRolesTag());
        tagsMap.put("hasPermission", new HasPermissionTag());
        tagsMap.put("hasRole", new HasRoleTag());
        tagsMap.put("lacksPermission", new LacksPermissionTag());
        tagsMap.put("lacksRole", new LacksRoleTag());
        tagsMap.put("notAuthenticated", new NotAuthenticatedTag());
        tagsMap.put("principal", new PrincipalTag());
        tagsMap.put("user", new UserTag());
        super.afterPropertiesSet();
        this.getConfiguration().setSharedVariable("shiro", new ShiroTags(tagsMap));
    }
}