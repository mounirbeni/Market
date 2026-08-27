-- الجداول
CREATE TABLE IF NOT EXISTS catalog_brands (
  make text NOT NULL, kind vehicle_kind NOT NULL DEFAULT 'car',
  country text, parent_group text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (make, kind));

CREATE TABLE IF NOT EXISTS catalog_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind vehicle_kind NOT NULL DEFAULT 'car',
  make text NOT NULL, model text NOT NULL, body body_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, make, model));

CREATE INDEX IF NOT EXISTS catalog_models_make_idx ON catalog_models (make);
CREATE INDEX IF NOT EXISTS catalog_models_kind_idx ON catalog_models (kind, make);

INSERT INTO schema_migrations (name) VALUES ('0004_catalog.sql') ON CONFLICT DO NOTHING;

-- الماركات
INSERT INTO catalog_brands (make, kind, country, parent_group) VALUES
('Abarth','car','Italy','Stellantis'),('Alfa Romeo','car','Italy','Stellantis'),('Alpine','car','France','Renault Group'),
('Aston Martin','car','United Kingdom','Aston Martin Lagonda'),('Audi','car','Germany','Volkswagen Group'),('BAIC','car','China','BAIC Group'),
('BMW','car','Germany','BMW Group'),('BYD','car','China','BYD'),('Bentley','car','United Kingdom','Volkswagen Group'),
('Changan','car','China','Changan Automobile'),('Chery','car','China','Chery Group'),('Chevrolet','car','United States','General Motors'),
('Citroën','car','France','Stellantis'),('Cupra','car','Spain','Volkswagen Group'),('DEEPAL','car','China','Changan Automobile'),
('DFSK','car','China','Seres Group'),('DS','car','France','Stellantis'),('Dacia','car','Romania','Renault Group'),
('Dongfeng','car','China','Dongfeng Motor'),('EXEED','car','China','Chery Group'),('Ferrari','car','Italy','Ferrari'),
('Fiat','car','Italy','Stellantis'),('Ford','car','United States','Ford Motor Company'),('Foton','car','China','BAIC/Foton'),
('GAZ','car','Russia','GAZ Group'),('GWM','car','China','Great Wall Motor'),('Geely','car','China','Geely Holding'),
('Honda','car','Japan','Honda Motor'),('Hyundai','car','South Korea','Hyundai Motor Group'),('Isuzu','car','Japan','Isuzu Motors'),
('JAC','car','China','JAC Group'),('Jaecoo','car','China','Chery Group'),('Jaguar','car','United Kingdom','JLR'),
('Jeep','car','United States','Stellantis'),('Jetour','car','China','Chery Group'),('KGM','car','South Korea','KG Mobility'),
('Kia','car','South Korea','Hyundai Motor Group'),('Land Rover','car','United Kingdom','JLR'),('Leapmotor','car','China','Leapmotor / Stellantis'),
('Lexus','car','Japan','Toyota Group'),('Lynk & Co','car','China','Geely Holding'),('MG','car','China/UK heritage','SAIC Motor'),
('Mahindra','car','India','Mahindra Group'),('Maserati','car','Italy','Stellantis'),('Mazda','car','Japan','Mazda Motor'),
('Mercedes','car','Germany','Mercedes-Benz Group'),('Mini','car','United Kingdom','BMW Group'),('Mitsubishi','car','Japan','Mitsubishi Motors'),
('Neo Motors','car','Morocco','Neo Motors'),('Nissan','car','Japan','Nissan Motor'),('Omoda','car','China','Chery Group'),
('Opel','car','Germany','Stellantis'),('Peugeot','car','France','Stellantis'),('Porsche','car','Germany','Volkswagen Group'),
('ROX','car','China','ROX Motor'),('Renault','car','France','Renault Group'),('Seat','car','Spain','Volkswagen Group'),
('Seres','car','China','Seres Group'),('Skoda','car','Czech Republic','Volkswagen Group'),('Smart','car','Germany/China','Mercedes-Benz / Geely'),
('Soueast','car','China','Chery Group'),('SsangYong','car','South Korea','KG Mobility'),('Suzuki','car','Japan','Suzuki Motor'),
('Tata','car','India','Tata Motors'),('Tesla','car','United States','Tesla'),('Toyota','car','Japan','Toyota Group'),
('Volkswagen','car','Germany','Volkswagen Group'),('Volvo','car','Sweden','Geely Holding'),('XPENG','car','China','XPENG'),
('Zeekr','car','China','Geely Holding'),('BMW','moto',NULL,NULL),('Bajaj','moto',NULL,NULL),('Benelli','moto',NULL,NULL),('Docker','moto',NULL,NULL),
('Haojue','moto',NULL,NULL),('Harley-Davidson','moto',NULL,NULL),('Honda','moto',NULL,NULL),('KTM','moto',NULL,NULL),('Kawasaki','moto',NULL,NULL),
('Kymco','moto',NULL,NULL),('MBK','moto',NULL,NULL),('Peugeot','moto',NULL,NULL),('Royal Enfield','moto',NULL,NULL),('SYM','moto',NULL,NULL),
('Suzuki','moto',NULL,NULL),('Vespa','moto',NULL,NULL),('Yamaha','moto',NULL,NULL)
ON CONFLICT (make, kind) DO UPDATE SET country=EXCLUDED.country, parent_group=EXCLUDED.parent_group;

-- الموديلات
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Abarth',unnest(ARRAY['500','500e','595','695']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Alfa Romeo',unnest(ARRAY['Giulia','Junior','Stelvio','Tonale']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Alpine',unnest(ARRAY['A110','A290','A390']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Aston Martin',unnest(ARRAY['DB12','DBX','Vanquish','Vantage']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Audi',unnest(ARRAY['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q6 e-tron','Q7','Q8','e-tron']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','BAIC',unnest(ARRAY['BJ30','BJ30e','BJ40','BJ60','BJ80','X35','X55','X7']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','BMW',unnest(ARRAY['1 Series','2 Series','3 Series','4 Series','5 Series','7 Series','8 Series','Série 1','Série 3','X1','X2','X3','X4','X5','X6','X7','Z4','i4','i5','i7','iX']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','BYD',unnest(ARRAY['Atto 3','Denza D9','Dolphin','Han','Qin Plus','Seagull','Seal','Seal U','Sealion 7','Shark 6','Song Plus','Tang']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Bentley',unnest(ARRAY['Bentayga','Continental GT','Flying Spur']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Changan',unnest(ARRAY['Alsvin','CS35 Plus','CS55 Plus','CS75 Plus','CS85','Hunter','UNI-K','UNI-T','UNI-V']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Chery',unnest(ARRAY['Arrizo 5','Arrizo 8','Tiggo 2 Pro','Tiggo 4 Pro','Tiggo 7 Pro','Tiggo 8 Pro','Tiggo 8 Pro Max']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Chevrolet',unnest(ARRAY['Captiva','Equinox','Groove','Spark','Tahoe','Tracker','Trax']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Citroën',unnest(ARRAY['Ami','Berlingo','C-Elysée','C3','C3 Aircross','C4','C4 X','C5 Aircross','Jumpy']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Cupra',unnest(ARRAY['Ateca','Born','Formentor','Leon','Tavascan','Terramar']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','DEEPAL',unnest(ARRAY['L07','S05','S07','SL03']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','DFSK',unnest(ARRAY['C31','C32','E5','Glory 500','Glory 580','K01h','K01s']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','DS',unnest(ARRAY['DS 3','DS 4','DS 7','DS 9']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Dacia',unnest(ARRAY['Bigster','Dokker','Duster','Jogger','Lodgy','Logan','Sandero','Sandero Stepway','Spring']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Dongfeng',unnest(ARRAY['Aeolus Yixuan','Box','Huge','Mage','Shine','T5 EVO']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','EXEED',unnest(ARRAY['LX','RX','TXL','VX','VX PHEV']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Ferrari',unnest(ARRAY['12Cilindri','296 GTB','296 GTS','Purosangue','Roma','SF90 Spider','SF90 Stradale']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Fiat',unnest(ARRAY['500','500X','500e','Doblo','Ducato','Grande Panda','Panda','Punto','Tipo','Topolino']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Ford',unnest(ARRAY['Bronco','Everest','Fiesta','Focus','Kuga','Mondeo','Mustang','Puma','Ranger','Tourneo Custom','Transit']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Foton',unnest(ARRAY['Aumark','TM','Toano','Tunland','Tunland G7']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','GAZ',unnest(ARRAY['Gazelle Next','Sobol','Ural Next']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','GWM',unnest(ARRAY['Haval H6','Haval H9','Haval Jolion','Poer','Poer KingKong','Tank 300','Tank 500']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Geely',unnest(ARRAY['Atlas','Coolray','Emgrand','GX3 Pro','Geometry C','Monjaro','Tugella']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Honda',unnest(ARRAY['Accord','CR-V','City','Civic','HR-V','ZR-V','e:Ny1']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Hyundai',unnest(ARRAY['Accent','Bayon','Elantra','Ioniq 5','Ioniq 6','Kona','Santa Fe','Staria','Tucson','i10','i20','i30']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Isuzu',unnest(ARRAY['D-Max','MU-X','N-Series']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','JAC',unnest(ARRAY['JS2','JS3','JS4','JS6','T8','T9']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Jaecoo',unnest(ARRAY['J5','J7','J7 PHEV','J8','J8 PHEV']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Jaguar',unnest(ARRAY['E-Pace','F-Pace','F-Type','I-Pace']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Jeep',unnest(ARRAY['Avenger','Compass','Grand Cherokee','Renegade','Wrangler']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Jetour',unnest(ARRAY['Dashing','T2','Traveller','X50','X70','X70 Plus','X90 Plus']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','KGM',unnest(ARRAY['Korando','Musso','Musso Grand','Rexton','Tivoli','Torres','Torres EVX']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Kia',unnest(ARRAY['Carnival','EV3','EV6','EV9','K3','K5','Niro','Picanto','Rio','Seltos','Sorento','Sportage']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Land Rover',unnest(ARRAY['Defender','Discovery','Discovery Sport','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Leapmotor',unnest(ARRAY['C10','C11','C16','T03']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Lexus',unnest(ARRAY['ES','LBX','LS','LX','NX','RX','UX']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Lynk & Co',unnest(ARRAY['01','02','03','05','06','09']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','MG',unnest(ARRAY['Cyberster','MG GT','MG HS','MG ZS','MG3','MG4','MG5','Marvel R']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Mahindra',unnest(ARRAY['PIK-UP','Scorpio','Thar','XUV300','XUV700']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Maserati',unnest(ARRAY['GranCabrio','GranTurismo','Grecale','Levante','MC20']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Mazda',unnest(ARRAY['CX-3','CX-30','CX-5','CX-60','CX-80','MX-5','Mazda 2','Mazda 3']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Mercedes',unnest(ARRAY['A-Class','B-Class','C-Class','CLA','CLE','Classe A','Classe C','Classe E','E-Class','EQA','EQB','EQE','EQS','G-Class','GLA','GLB','GLC','GLE','GLS','S-Class']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Mini',unnest(ARRAY['Aceman','Clubman','Cooper 3 Door','Cooper 5 Door','Cooper Convertible','Countryman']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Mitsubishi',unnest(ARRAY['ASX','Eclipse Cross','L200','Outlander','Pajero Sport']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Neo Motors',unnest(ARRAY['Neo','Neo City']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Nissan',unnest(ARRAY['Ariya','Juke','Micra','Navara','Qashqai','X-Trail']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Omoda',unnest(ARRAY['Omoda 5','Omoda 7','Omoda C5','Omoda E5']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Opel',unnest(ARRAY['Astra','Combo','Corsa','Crossland','Grandland','Mokka','Vivaro','Zafira Life']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Peugeot',unnest(ARRAY['2008','208','3008','301','308','408','5008','508','Boxer','Expert','Partner','Rifter','e-2008','e-208']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Porsche',unnest(ARRAY['718 Boxster','718 Cayman','911','Cayenne','Macan','Panamera','Taycan']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','ROX',unnest(ARRAY['01','01 REEV']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Renault',unnest(ARRAY['Arkana','Austral','Captur','Clio','Clio 4','Espace','Express','Kangoo','Master','Megane','Mégane','Rafale','Symbol','Trafic','Zoe']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Seat',unnest(ARRAY['Arona','Ateca','Ibiza','Leon','Tarraco']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Seres',unnest(ARRAY['3','5','7','SF5']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Skoda',unnest(ARRAY['Enyaq','Fabia','Kamiq','Karoq','Kodiaq','Octavia','Scala','Superb']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Smart',unnest(ARRAY['#1','#3','#5']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Soueast',unnest(ARRAY['S06','S07','S09']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','SsangYong',unnest(ARRAY['Korando','Musso','Rexton','Tivoli','Torres']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Suzuki',unnest(ARRAY['Across','Baleno','Dzire','Jimny','S-Cross','Swift','Vitara']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Tata',unnest(ARRAY['Harrier','Nexon','Punch','Safari','Super Ace','Tiago','Tigor']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Tesla',unnest(ARRAY['Cybertruck','Model 3','Model S','Model X','Model Y']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Toyota',unnest(ARRAY['Aygo X','C-HR','Camry','Corolla','Corolla Cross','Fortuner','Hilux','Land Cruiser','Proace','RAV4','Yaris','Yaris Cross']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Volkswagen',unnest(ARRAY['Arteon','Caddy','Golf','Golf 7','Golf 8','Golf Variant','ID.3','ID.4','ID.5','ID.7','Passat','Polo','T-Cross','T-Roc','Taigo','Tiguan','Touareg','Transporter']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Volvo',unnest(ARRAY['EC40','EX30','EX40','EX90','S60','S90','XC40','XC60','XC90']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','XPENG',unnest(ARRAY['G3','G6','G9','P7','P7+','X9']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'car','Zeekr',unnest(ARRAY['001','007','009','7X','X']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','BMW',unnest(ARRAY['F 850 GS','R 1200 GS']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Bajaj',unnest(ARRAY['Boxer','Pulsar']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Benelli',unnest(ARRAY['TRK 502']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Docker',unnest(ARRAY['Star']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Haojue',unnest(ARRAY['DK 150']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Harley-Davidson',unnest(ARRAY['Forty-Eight','Iron 883']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Honda',unnest(ARRAY['Africa Twin','CB500X','CBR 600RR','Forza 125','PCX 125','Transalp 750']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','KTM',unnest(ARRAY['790 Adventure','Duke 390']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Kawasaki',unnest(ARRAY['Ninja 650','Z650']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Kymco',unnest(ARRAY['Agility 125']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','MBK',unnest(ARRAY['Booster']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Peugeot',unnest(ARRAY['Django','Kisbee']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Royal Enfield',unnest(ARRAY['Classic 500','Meteor 350']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','SYM',unnest(ARRAY['Jet 14','Symphony 125']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Suzuki',unnest(ARRAY['GSX-R 600']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Vespa',unnest(ARRAY['Primavera 125']) ON CONFLICT DO NOTHING;
INSERT INTO catalog_models (kind,make,model) SELECT 'moto','Yamaha',unnest(ARRAY['Aerox','MT-07','NMAX','R6','Tracer 700','Ténéré 700']) ON CONFLICT DO NOTHING;

-- الفئات (اللي معروفة)
UPDATE catalog_models c SET body = v.body::body_type FROM (VALUES
('Audi','A3','citadine'),('Audi','A4','berline'),('Audi','Q3','suv'),('BMW','Série 1','citadine'),('BMW','Série 3','berline'),('BMW','X1','suv'),
('Chevrolet','Spark','citadine'),('Citroën','C-Elysée','berline'),('Citroën','C3','citadine'),('Dacia','Dokker','utilitaire'),('Dacia','Duster','suv'),
('Dacia','Lodgy','break'),('Dacia','Logan','berline'),('Dacia','Sandero','citadine'),('Dacia','Spring','citadine'),('Fiat','Punto','citadine'),
('Fiat','Tipo','berline'),('Ford','Fiesta','citadine'),('Ford','Focus','citadine'),('Ford','Ranger','utilitaire'),('Hyundai','Accent','berline'),
('Hyundai','Kona','suv'),('Hyundai','Tucson','suv'),('Hyundai','i10','citadine'),('Hyundai','i20','citadine'),('Isuzu','D-Max','utilitaire'),
('Jeep','Compass','suv'),('Kia','Picanto','citadine'),('Kia','Rio','citadine'),('Kia','Sportage','suv'),('Land Rover','Range Rover Evoque','suv'),
('Mercedes','Classe A','citadine'),('Mercedes','Classe C','berline'),('Mercedes','Classe E','berline'),('Mitsubishi','L200','utilitaire'),
('Nissan','Micra','citadine'),('Nissan','Qashqai','suv'),('Opel','Corsa','citadine'),('Peugeot','208','citadine'),('Peugeot','3008','suv'),
('Peugeot','301','berline'),('Peugeot','Partner','utilitaire'),('Renault','Captur','suv'),('Renault','Clio 4','citadine'),
('Renault','Kangoo','utilitaire'),('Renault','Mégane','berline'),('Renault','Symbol','berline'),('Renault','Zoe','citadine'),
('Seat','Ibiza','citadine'),('Seat','Leon','citadine'),('Skoda','Fabia','citadine'),('Skoda','Octavia','berline'),('Suzuki','Swift','citadine'),
('Tesla','Model 3','berline'),('Toyota','Corolla','berline'),('Toyota','Hilux','utilitaire'),('Toyota','Yaris','citadine'),
('Volkswagen','Caddy','utilitaire'),('Volkswagen','Golf 7','citadine'),('Volkswagen','Golf 8','citadine'),('Volkswagen','Passat','berline'),
('Volkswagen','Polo','citadine'),('Volkswagen','Tiguan','suv'),('BMW','F 850 GS','trail'),('BMW','R 1200 GS','trail'),('Bajaj','Boxer','roadster'),
('Bajaj','Pulsar','roadster'),('Benelli','TRK 502','trail'),('Docker','Star','roadster'),('Haojue','DK 150','roadster'),
('Harley-Davidson','Forty-Eight','custom'),('Harley-Davidson','Iron 883','custom'),('Honda','Africa Twin','trail'),('Honda','CB500X','trail'),
('Honda','CBR 600RR','sportive'),('Honda','Forza 125','scooter'),('Honda','PCX 125','scooter'),('Honda','Transalp 750','trail'),
('KTM','790 Adventure','trail'),('KTM','Duke 390','roadster'),('Kawasaki','Ninja 650','sportive'),('Kawasaki','Z650','roadster'),
('Kymco','Agility 125','scooter'),('MBK','Booster','scooter'),('Peugeot','Django','scooter'),('Peugeot','Kisbee','scooter'),
('Royal Enfield','Classic 500','custom'),('Royal Enfield','Meteor 350','custom'),('SYM','Jet 14','scooter'),('SYM','Symphony 125','scooter'),
('Suzuki','GSX-R 600','sportive'),('Vespa','Primavera 125','scooter'),('Yamaha','Aerox','scooter'),('Yamaha','MT-07','roadster'),
('Yamaha','NMAX','scooter'),('Yamaha','R6','sportive'),('Yamaha','Tracer 700','trail'),('Yamaha','Ténéré 700','trail')
) AS v(make,model,body) WHERE c.make=v.make AND c.model=v.model;

SELECT kind, count(*) AS n FROM catalog_models GROUP BY kind ORDER BY kind;