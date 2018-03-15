### ✔ 短地址管理

#### ✔ `POST` `/short/add` - 新增一条短地址

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
short            | body   | String    | Required   |                               | 短地址
long            | body   | String     | Required   |                               | 长地址
site_name       | body   | String     | Optional   |                               | 网站名称
image          | file   | String     | Optional   |                               | 网站图片

+ Return: `HTTP Status: 201`

```javascript
{
    "id": 10,
    "short": "apple",
    "long": "apple.com",
    "site_name": "苹果",
    "logo_url": "xxxx"
}
```
---------------------

#### ✔ `POST` `/short/update` - 编辑短地址

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id               | body   | String    | Required   |                               | id
short            | body   | String    | Required   |                               | 短地址
long            | body   | String     | Required   |                               | 长地址
site_name       | body   | String     | Optional   |                               | 网站名称
logo_url          | body/file   | String     | Optional   |                               | 网站图片

+ Return: `HTTP Status: 201`

```javascript
{
    "id": 10,
    "short": "apple",
    "long": "apple.com",
    "site_name": "苹果",
    "logo_url": "xxxx"
}
```
---------------------

#### ✔ `GET` `/user/list` - 获取下级用户列表

+ Parameters:

Field Name     | Scope   | Type       | Attributes | Validation                  | Description      
-------------- | ------- | ----------- | ----------- | -----------------------   | -------------
page           | query   | Number     | Optional   |   Int, Min(1), Default(1)   | 页码
pagesize       | query   | Number     | Optional   |   Int, Min(1), Default(10)  | 每页数量

+ Return: `HTTP Status: 200`

```javascript
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
---------------------
