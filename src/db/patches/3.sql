
CREATE TABLE port (
    id serial,
    userid bigint,
    client varchar(255) UNIQUE,
    port int,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT INTO port (userid, client, port)
VALUES
    (1, 'tripleone', 22860),
    (2, 'agtop', 21866),
    (3, 'hxpj', 21868),
    (4, 'le18', 21871),
    (5, 'macaopj', 21867),
    (6, 'mgm', 21861),
    (7, 'twinbet', 21870),
    (8, 'xc33', 21872),
    (9, 'xpj', 21865),
    (10, 'yuanbao361', 21873),
    (11, 'wb88', 21869),
    (12, 'olobet', 21862),
    (13, 'win007', 21863),
    (14, 'dw777', 21864)
;