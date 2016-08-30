#web-front

整个脚手架的思路如下：
首先gulp add，输入filename 之后能自动在  
- src/html 下创建[filename].html  
- src/js 下创建[filename].js  
- src/scss 下创建[filename].scss  
之后会生成assets文件夹，里面含有已经插入script和link的html文件，模板html文件如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<% content %>
<script type="text/javascript" src="/dist/vender.js"></script><script type="text/javascript" src="/dist/home.js"></script></body>
</html>
```


而我们真正使用的是views下面自己创建的filename.html 这个使用ect模板
```
<% extend '../assets/filename.html' %>
```
来使用在assets下面的html的script和link

app.js 使用 webpack-dev-server也会编译一遍webpack-dev.config放到内存中  
dev-sever内存中的文件配合hot加载能自动发送事件reload整个页面  
优点如下 ： 
- 由于上面asserts下面html的引用路径和在dev-sever在内存中的路径是一致的，所以你永远不用担心js和css文件路径问题了  
- 能够充分利用ect模板的优势而不是像https://github.com/chemdemo/webpack-seed.git那样只能使用静态文件
- 同时，自动reload页面不需要手动F5刷新