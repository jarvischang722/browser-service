
CREATE TABLE version (
    id serial,
    ver int,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user (
    id serial,
    username varchar(255) UNIQUE,
    password varchar(255),
    salt varchar(255),
    role int DEFAULT 1,
    name varchar(255),
    status int DEFAULT 1,
    parent bigint,
    expire_in timestamp,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO user (code, password, name)
VALUES
('tripleone', 'pass1234', '合众科技'),
('agtop', 'pass1234', '澳门新葡京'),
('hxpj', 'pass1234', '澳门新葡京'),
('le18', 'pass1234', '乐赢'),
('macaopj', 'pass1234', '澳门葡京'),
('mgm', 'pass1234', '美高梅'),
('twinbet', 'pass1234', 'Twinbet'),
('xc33', 'pass1234', '新橙娱乐'),
('xpj', 'pass1234', '新葡京'),
('yuanbao361', 'pass1234', '元宝娱乐'),
('wb88', 'pass1234', '万博娱乐城')
;

UPDATE user
SET parent = 1
WHERE id <> 1
;