package com.xz.logistics.utils;

import org.apache.http.conn.HttpClientConnectionManager;

/**
 * 关闭HTTP空闲连接、无效连接.
 * 
 */
public class IdleConnectionMonitorThread extends Thread {

    private final HttpClientConnectionManager connMgr;
    private volatile boolean shutdown;

    public IdleConnectionMonitorThread(HttpClientConnectionManager connMgr) {
        super();
        this.connMgr = connMgr;
    }

    @Override
    public void run() {
        try {
            while (!shutdown) {
                synchronized (this) {
                    wait(5000);

                    // 关闭无效连接
                    connMgr.closeExpiredConnections();
                    
                    // 可选, 关闭空闲超过30秒的
                    //connMgr.closeIdleConnections(30, TimeUnit.SECONDS);
                }
            }
        } catch (InterruptedException ex) {
            // terminate
        }
    }

    public void shutdown() {
        shutdown = true;
        synchronized (this) {
            notifyAll();
        }
    }

}