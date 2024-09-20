-- Insert roles
INSERT INTO role (name) VALUES ('Lærer');
INSERT INTO role (name) VALUES ('Elev');
INSERT INTO role (name) VALUES ('Administrator');

-- Insert subjects (expanded with more flexibility and additional subjects)
INSERT INTO subject (name) VALUES ('Norsk');
INSERT INTO subject (name) VALUES ('Matematikk');
INSERT INTO subject (name) VALUES ('Naturfag');
INSERT INTO subject (name) VALUES ('Engelsk');
INSERT INTO subject (name) VALUES ('Historie');
INSERT INTO subject (name) VALUES ('Geografi');
INSERT INTO subject (name) VALUES ('Samfunnsfag');
INSERT INTO subject (name) VALUES ('Kjemi');
INSERT INTO subject (name) VALUES ('Fysikk');
INSERT INTO subject (name) VALUES ('Biologi');
INSERT INTO subject (name) VALUES ('Økonomi fag');
INSERT INTO subject (name) VALUES ('Psykologi');
INSERT INTO subject (name) VALUES ('Rettslære');

-- Insert rooms
INSERT INTO room (name) VALUES ('Bibliotektet');
INSERT INTO room (name) VALUES ('Rom 417');
INSERT INTO room (name) VALUES ('Rom 416');
INSERT INTO room (name) VALUES ('Rom 415');

-- Insert statuses
INSERT INTO status (name) VALUES ('Ubekreftet');
INSERT INTO status (name) VALUES ('Bekreftet');
INSERT INTO status (name) VALUES ('Annulert');

-- Insert users (using role references, isAdmin as a boolean)
INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES ('Ola', 'Nordmann', 1, 1, 'ola@mail.no');
INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES ('Kari', 'Nordmann', 2, 0, 'kari@mail.no');
INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES ('Per', 'Hansen', 2, 0, 'per@mail.no');
INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES ('Lise', 'Berg', 3, 0, 'lise@mail.no');

-- Insert activities (assumes user IDs, subject IDs, room IDs, and status IDs match the entries)
INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (1, '2024-09-01 08:00:00', 1, 1, 1, 90);

INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (2, '2024-09-01 10:00:00', 2, 2, 2, 60);

INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (3, '2024-09-01 11:00:00', 3, 3, 1, 120);

INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (4, '2024-09-01 12:00:00', 4, 4, 3, 45);

-- More flexible activity example with nullable room
INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (1, '2024-09-02 09:00:00', 5, NULL, 2, 90);

-- Another example with a different user and subject
INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) 
VALUES (3, '2024-09-02 14:00:00', 10, 3, 1, 120);
