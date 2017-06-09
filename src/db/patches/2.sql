
CREATE TABLE player (
    id serial,
    username varchar(255),
    email varchar(255),
    password varchar(255),
    verify boolean,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
