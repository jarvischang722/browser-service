# tripleonetech-discover-service v1.0.0

Tripleonetech discover service

- [Browser](#browser)
	- [获得用户主页以及SS](#获得用户主页以及ss)
	- [获得浏览器信息](#获得浏览器信息)
	- [上传安装档](#上传安装档)
	- [生成浏览器](#生成浏览器)
	
- [Short](#short)
	- [获取可用shadowsocks server 列表](#获取可用shadowsocks-server-列表)
	- [编辑短地址](#编辑短地址)
	- [获取短地址列表](#获取短地址列表)
	- [新增一条短地址](#新增一条短地址)
	- [编辑短地址](#编辑短地址)
	
- [User](#user)
	- [获取下级用户列表](#获取下级用户列表)
	- [获取用户信息](#获取用户信息)
	- [recurrent](#recurrent)
	- [创建下级代理/客户](#创建下级代理/客户)
	- [修改下级代理过期时间](#修改下级代理过期时间)
	- [登陆](#登陆)
	- [更新用户信息](#更新用户信息)
	
- [Version](#version)
	- [获取版本号详情](#获取版本号详情)
	- [获取某客户下版本号列表](#获取某客户下版本号列表)
	- [新增或更新版本号](#新增或更新版本号)
	


# Browser

## 获得用户主页以及SS

<p>获得用户的主页以及返回可用的shadow socks资讯</p>

	GET /browser/homeUrlAndSsInfo


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| clientName			| String	| Required|  <p>用户username</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| homeUrlList| Array| <p>该用户所有主页</p>|
| ssList| Array| <p>可用的shadow socks资讯</p>|

### Success Response

Success-Response:

```
HTTP Status: 200
    {
      "homeUrlList": [
            "https://t1t.games.org/",
            "https://t2t.games.org/"
        ],
        "ssList": [
            {
                "serverAddr": "35.201.204.2",
                "serverPort": 19999,
                "password": "dBbQMP8Nd9vyjvN",
                "method": "aes-256-cfb"
            },
            {
                "serverAddr": "35.201.204.2",
                "serverPort": 19999,
                "password": "dBbQMP8Nd9vyjvN",
                "method": "aes-256-cfb"
            }
        ]
      }
```

## 获得浏览器信息

<p>获得自己的浏览器信息</p>

	GET /browser/info

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Content-Type			| String			|  							|
| X-Auth-Key			| String			|  <p>登陆之后返回的auth token</p>							|

### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number	| Optional|  <p>用户id</p>							|


### Success Response

Success-Response:

```
HTTP Status: 200
    {
     "platform": "Windows",
     "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
     "version": {
       "local": "2.9.0",
       "server": "2.9.2"
      }
     }
```

## 上传安装档

<p>上传Build 完的安装档到server deploy</p>

	GET /browser/uploadSetup


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| filename			| File	| Required|  							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| success| Boolean| |
| errorMsg| Boolean| |

### Success Response

Success-Response:

```
HTTP Status: 200
 {
   success: true
 }
```

## 生成浏览器

<p>为目标用户生成浏览器</p>

	POST /browser/create

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Content-Type			| String			|  							|
| X-Auth-Key			| String			|  <p>登陆之后返回的auth token</p>							|

### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number	| Optional|  <p>用户id</p> <p>說明</p> <ol> <li>如果没有传id, 则获取自己的profile</li> <li>如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError</li> </ol>							|


### Success Response

Success-Response:

```
HTTP Status: 204
    {
    }
```

# Short

## 获取可用shadowsocks server 列表



	GET /browser/ss



### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| ss| String| <p>shadowsockts 列表经由DES加密后再base64编码</p>|

### Success Response

Success-Response:

```
HTTP Status: 200
{

"ss":"ydWUdlhwHrKZjC0Hg67tzF5GdkvMBB4odoPpXIUsmzpbRc1iYfpskjVHgY5b/u0TePWFQMsoi1Oy3eMiE
     3l+6JmMLQeDru3MbQMmJEpaYBD3k0DmjHr1sXEQtmy9PuI6x2v5hQrAqcIGlgRZHdXTLQ=="
}
```

## 编辑短地址



	GET /short/detail


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number	| Required|  <p>id</p>							|


### Success 201
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| short| String| |
| long| String| |
| site_name| String| |
| logo_url| String| |

### Success Response

Success-Response:

```
HTTP Status: 201
{
"id": 1,
"short": "apple",
"long": "apple.com",
"site_name": "苹果",
"logo_url": "xxxx"
}
```

## 获取短地址列表



	GET /short/list


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| page			| Number	| Optional|  <p>页码</p>							|
| pagesize			| Number	| Optional|  <p>每页数量</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| total| Number| |
| items| Object[]| |
| items.id| String| |
| items.short| String| |
| items.long| String| |
| items.site_name| String| |
| items.logo_url| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
"total": 10,
"items": [
  {
    "id": 1,
    "short": "apple",
    "long": "apple.com",
    "site_name": "苹果",
    "logo_url": "xxxx"
  }
]
}
```

## 新增一条短地址



	POST /short/add


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| short			| String	| Required|  <p>短地址</p>							|
| long			| String	| Required|  <p>长地址</p>							|
| site_name			| String	| Optional|  <p>网站名称</p>							|
| logo_url			| String	| Optional|  <p>网站图片</p>							|


### Success 201
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| short| String| |
| long| String| |
| site_name| String| |
| logo_url| String| |

### Success Response

Success-Response:

```
HTTP Status: 201
{
   "id": 10,
   "short": "apple",
   "long": "apple.com",
   "site_name": "苹果",
   "logo_url": "xxxx"
}
```

## 编辑短地址



	POST /short/update


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| String	| Required|  <p>id</p>							|
| short			| String	| Required|  <p>短地址</p>							|
| long			| String	| Required|  <p>长地址</p>							|
| site_name			| String	| Optional|  <p>网站名称</p>							|
| logo_url			| String	| Optional|  <p>网站图片</p>							|


### Success 201
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| short| String| |
| long| String| |
| site_name| String| |
| logo_url| String| |

### Success Response

Success-Response:

```
HTTP Status: 201
{
 "id": 10,
 "short": "apple",
 "long": "apple.com",
 "site_name": "苹果",
 "logo_url": "xxxx"
}
```

# User

## 获取下级用户列表



	GET /user/list


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| page			| Number	| Optional|  <p>页码</p>							|
| pagesize			| Number	| Optional|  <p>每页数量</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| username| String| |
| password| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
  "total": 10,
  "items": [
      {
          "id": 1,
          "role": 1,
          "username": "tripleone",
          "name": "合众科技",
          "expireIn": "1510641466"
      }
  ]
}
```

## 获取用户信息

<p>获得目标用户的信息</p>

	GET /user/profile


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number	| Required|  <p>用户id</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| role| Number| |
| username| String| |
| name| String| |
| expireIn| String| |
| browser| Object| |
| browser.link| String| |
| browser.version| Object| |
| browser.version.local| String| |
| browser.version.server| String| |
| icon| String| |
| homeUrl| Array| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "username": "tripleone",
   "name": "合众科技",
   "expireIn": "1510641466",
   "browser": {
       "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
       "version": {
           "local": "2.9.0",
           "server": "2.9.2"
       }
   },
   "icon": "/icon/tripleone.ico",
   "homeUrl": [
       "https://www.tripleonetech.com",
       "https://www.tripleonetech.net"
   ]
}
```

## recurrent

<p>recurrent</p>

	GET /user/recurrent



### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| role| Number| |
| token| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
}
```

## 创建下级代理/客户



	POST /user/create


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| username			| String	| Required|  <p>用户名(唯一)</p>							|
| name			| String	| Required|  <p>名称</p>							|
| role			| Number	| Required|  <p>权限 1: 代理 2: 客户</p>							|
| expireIn			| Date	| Required|  <p>过期时间, 不能超过自己的</p>							|


### Success 201
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| username| String| |
| password| String| |

### Success Response

Success-Response:

```
HTTP Status: 201
{
  "id": 10,
  "username": "tripleone",
  "password": "pass1234"
}
```

## 修改下级代理过期时间



	POST /user/expire


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| String	| Required|  <p>用户id</p>							|
| expireIn			| Date	| Required|  <p>过期时间, 不能超过自己的</p>							|


### Success 201
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| expireIn| String| |

### Success Response

Success-Response:

```
HTTP Status: 201
{
  "id": 10,
  "expireIn": "1510641466"
}
```

## 登陆

<p>登陆</p>

	POST /user/login


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| username			| String	| Required|  <p>用户名</p>							|
| password			| String	| Required|  <p>密码</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| role| Number| |
| token| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
}
```

## 更新用户信息

<p>更新目标用户的信息</p>

	POST /user/profile


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number	| Optional|  <p>用户id</p>							|
| name			| String	| Required|  <p>名称</p>							|
| homeUrl			| String[]	| Required|  <p>主页列表</p>							|
| icon			| String	| Required|  <p>用户图标</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| name| String| |
| icon| String| |
| homeUrl| Array| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
  "id": 1,
  "name": "合众科技",
  "icon": "/icon/tripleone.ico",
  "homeUrl": [
      "https://www.tripleonetech.com",
      "https://www.tripleonetech.net"
  ]
}
```

# Version

## 获取版本号详情



	GET /browser/detail


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| user			| Number	| Required|  <p>用户id</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| id| Number| |
| platform| String| |
| link| String| |
| version| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
 "id": 1,
 "platform": "ios",
 "link": "apple.com",
 "version": "xxx"
}
```

## 获取某客户下版本号列表



	GET /browser/list


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| user			| Number	| Required|  <p>用户id</p>							|


### Success 200
| Field    | Type        | Description                          |
|---------|-----------|--------------------------------------|
| total| Number| |
| items| Object[]| |
| items.id| Number| |
| items.platform| String| |
| items.link| String| |
| items.version| String| |

### Success Response

Success-Response:

```
HTTP Status: 200
{
 "total": 10,
 "items": [
   {
     "id": 1,
     "platform": "ios",
     "link": "apple.com",
     "version": "xxx"
   }
 ]
}
```

## 新增或更新版本号



	POST /browser/info


### Parameters

| Name    | Type      | Attribute      | Description                          |
|---------|-----------|--------------------------------------|
| user			| Number	| Required|  <p>短地址 用户id</p>							|
| platform			| String	| Required|  <p>平台</p>							|
| link			| String	| Required|  <p>长地址</p>							|
| version			| String	| Required|  <p>网站名称</p>							|


### Success Response

Success-Response:

```
HTTP Status: 204
```


