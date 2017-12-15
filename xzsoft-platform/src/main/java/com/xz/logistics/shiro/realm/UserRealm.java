package com.xz.logistics.shiro.realm;


import javax.annotation.Resource;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.util.ByteSource;

import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.UserInfo;


public class UserRealm extends AuthorizingRealm{
	@Resource
	private UserInfoFacade userInfoFacade;
	
	/**
	 * 权限验证
	 */
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(
			PrincipalCollection principals) {
		String username = (String)principals.getPrimaryPrincipal();
		SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
		authorizationInfo.setRoles(userInfoFacade.findRoles(username));
		authorizationInfo.setStringPermissions(userInfoFacade.findPermissions(username));
		return authorizationInfo;
	}

	/**
	 * 登录验证
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(
			AuthenticationToken token) throws AuthenticationException {
		String username = (String)token.getPrincipal();
		UserInfo user = userInfoFacade.findUserByUsername(username);
		if(user == null){
			throw new UnknownAccountException();
		}
		SimpleAuthenticationInfo authenticationInfo = new SimpleAuthenticationInfo(
				user.getUserName(), 
				user.getPassword(), 
				ByteSource.Util.bytes(user.getCredentialsSalt()), 
				getName());
		
		return authenticationInfo;
	}

	@Override
	public void clearCachedAuthorizationInfo(PrincipalCollection principals) {
		super.clearCachedAuthorizationInfo(principals);
	}

	@Override
	public void clearCachedAuthenticationInfo(PrincipalCollection principals) {
		super.clearCachedAuthenticationInfo(principals);
	}

	@Override
	public void clearCache(PrincipalCollection principals) {
		super.clearCache(principals);
	}
	
	public void clearAllCachedAuthorizationInfo(){
		getAuthorizationCache().clear();
	}
	
	public void clearAllCachedAuthenticationInfo(){
		getAuthenticationCache().clear();
	}
	
	public void clearAllCache(){
		clearAllCachedAuthenticationInfo();
		clearAllCachedAuthorizationInfo();
	}
}
