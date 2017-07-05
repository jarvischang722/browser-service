### ✔ 浏览器

#### ✔ `GET` `/browser/info` - 获得浏览器信息

获得自己的浏览器信息

+ Headers:

Key                   | Value                 | Description      
------------------- | -------------------- | -----------
Content-Type      | application/json  |      
X-Auth-Key        | eyJhbGci...         |  登陆之后返回的auth token      

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id                  | query  | Int          | Optional   |   Number, Min(1)      | 用户id 

+ Return: `HTTP Status: 200`

```javascript
{
    "platform": "windows",
    "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
    "version": {
        "local": "2.9.0",
        "server": "2.9.2"
    }
}
```

---------------------

#### ✔ `POST` `/browser/create` - 生成浏览器

为目标用户生成浏览器

+ Headers:

Key                   | Value                 | Description      
------------------- | -------------------- | -----------
Content-Type      | application/json  |      
X-Auth-Key        | eyJhbGci...         |  登陆之后返回的auth token      

+ 说明
    1. 如果没有传id, 则获取自己的profile
    2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id                  | body  | Int          | Optional   |   Number, Min(1)      | 用户id 

+ Return: `HTTP Status: 204`

---------------------
