package com.xz.logistics.shiro.common.tags;

import freemarker.template.SimpleHash;

import java.util.Map;

/**
 * Shortcut for injecting the tags into Freemarker
 * <p>
 * <p>Usage: cfg.setSharedVeriable("shiro", new ShiroTags());</p>
 */
public class ShiroTags extends SimpleHash {
    public ShiroTags(Map<String, Object> tagsMap) {
        super(tagsMap, null);
    }
}