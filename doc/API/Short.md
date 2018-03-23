### ✔ 短地址管理

只有tripleone可以调用

#### ✔ `POST` `/short/add` - 新增一条短地址

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
short            | body   | String    | Required   |                               | 短地址
long            | body   | String     | Required   |                               | 长地址
site_name       | body   | String     | Optional   |                               | 网站名称
logo_url          | file   | String     | Optional   |                               | 网站图片

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

Field Name       | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id               | body   | String    | Required   |                               | id
short            | body   | String    | Required   |                               | 短地址
long             | body   | String     | Required   |                               | 长地址
site_name        | body   | String     | Optional   |                               | 网站名称
logo_url         | body/file   | String     | Optional   |                               | 网站图片

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

#### ✔ `GET` `/short/list` - 获取短地址列表

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
      "short": "apple",
      "long": "apple.com",
      "site_name": "苹果",
      "logo_url": "xxxx"
    }
  ]
}
```
---------------------

#### ✔ `GET` `/short/detail` - 获取短地址详情

+ Parameters:

Field Name     | Scope   | Type       | Attributes | Validation                  | Description      
-------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id           | query   | Number     | Required   |   Int, Min(1)   | id

+ Return: `HTTP Status: 200`

```javascript
{
  "id": 1,
  "short": "apple",
  "long": "apple.com",
  "site_name": "苹果",
  "logo_url": "xxxx"
}
```
---------------------
