CREATE TABLE user_mapping (
    id serial,
    userid int,
    merchant varchar(255),
    playerid int,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
