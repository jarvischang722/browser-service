### ✔ 用户

#### ✔ `POST` `/user/login` - 登陆

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
username       | body  | String     | Required   |                               | 用户名        
password        | body  | String     | Required   |                               | 密码        

+ Return: `HTTP Status: 200`

```javascript
{
    id: 1,
    username: tripleone,
    name: '合众科技',
    expireIn: '2017-07-29 16:34:59'
    browsers: [
        {
            platform: 'windows',
            link: '',
            version: '2.9.0',
            currentVersion: '2.9.2',
        }
    ],
    token: 'xxxx'
}
```

---------------------
