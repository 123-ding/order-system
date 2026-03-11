<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

:root {
  --van-primary-color: #0066cc;
  --van-button-primary-background: #0066cc;
  --van-button-primary-border-color: #0066cc;
  --van-tabbar-item-active-color: #0066cc;
  --van-tabs-bottom-bar-color: #0066cc;
  --van-step-active-color: #0066cc;
  --van-switch-on-background: #0066cc;
  --van-tag-primary-color: #0066cc;
}
</style>
