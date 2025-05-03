-- Optional Create the database
-- CREATE DATABASE landmark_db;
-- USE landmark_db;

DROP TABLE IF EXISTS landmark_references;
DROP TABLE IF EXISTS landmarks;

CREATE TABLE landmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    city VARCHAR(50),
    country VARCHAR(50),
    year_built INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE landmark_references (
    id INT PRIMARY KEY AUTO_INCREMENT,
    landmark_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(150),
    source VARCHAR(100),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (landmark_id) REFERENCES landmarks(id) ON DELETE CASCADE
);


INSERT INTO landmarks (tag, name, latitude, longitude, description, category, city, country, year_built) VALUES
('acm', 'Asian Civilisations Museum', 1.28750000, 103.85150000, 'Step into the rich tapestry of Asian history at the Asian Civilisations Museum, housed in the beautifully restored Empress Place Building, originally built in 1867. Opened as a museum in 2003, it explores the cultures of China, Southeast Asia, South Asia, and West Asia through artifacts like ancient ceramics and textiles. "The museum traces the cultural roots of Singapore’s multi-ethnic society" [National Heritage Board], making it a must-visit for travelers wanting to understand the region’s heritage.', 'Museum', 'Singapore', 'Singapore', 2003),
('anderson_bridge','Anderson Bridge', 1.28720000, 103.85290000, 'Marvel at Anderson Bridge, a steel beauty opened in 1910 across the Singapore River, named after Sir John Anderson, Governor of the Straits Settlements from 1904–1911. Built to ease traffic from the aging Cavenagh Bridge, it’s known for its "three steel arches and fluted piers" [Wikipedia], offering a picturesque blend of engineering and history. Perfect for a scenic stroll or photo stop near the Fullerton Hotel.', 'Bridge', 'Singapore', 'Singapore', 1910),
('apple_marina_bay','Apple Marina Bay', 1.28440000, 103.85930000, 'Visit Apple Marina Bay Sands, the world’s first floating Apple Store, opened in 2020 on Marina Bay’s shimmering waters. This glass sphere, connected by a boardwalk, boasts "a breathtaking view of the Singapore skyline" [Apple] and an underwater entrance from The Shoppes. A futuristic gem for tech fans and architecture lovers, it’s a one-of-a-kind shopping experience.', 'Retail', 'Singapore', 'Singapore', 2020),
('art_sci_museum','ArtScience Museum', 1.28600000, 103.85930000, 'Explore the ArtScience Museum, a lotus-shaped marvel opened in 2011 at Marina Bay Sands, designed by Moshe Safdie. Its unique design and interactive exhibits fuse art and science, from futuristic displays to ancient treasures. "The museum’s mission is to explore where art, science, and technology meet" [Marina Bay Sands], making it a captivating stop for families and curious travelers.', 'Museum', 'Singapore', 'Singapore', 2011),
('cavenagh_bridge','Cavenagh Bridge', 1.28660000, 103.85260000, 'Walk across Cavenagh Bridge, Singapore’s oldest suspension bridge, completed in 1869. Named after Major General William Cavenagh, it once linked colonial and commercial districts with its "elegant suspension design" [Wikipedia]. Now pedestrian-only, its Victorian ironwork offers a nostalgic contrast to the modern skyline—ideal for history lovers and photographers.', 'Bridge', 'Singapore', 'Singapore', 1869),
('dal_obelisk','Dalhousie Obelisk', 1.28810000, 103.85240000, 'Discover the Dalhousie Obelisk, a modest monument erected in 1850 to honor Lord James Dalhousie, Governor-General of India, who visited Singapore that year. Designed by John Turnbull Thomson, it’s a subtle nod to colonial history near the Asian Civilisations Museum. "It commemorates Dalhousie’s contributions to trade" [National Library Board], offering a quick, intriguing stop for history buffs.', 'Monument', 'Singapore', 'Singapore', 1850),
('esplanade','Esplanade', 1.28990000, 103.85560000, 'Known as "The Durians" for its spiky roof, the Esplanade - Theatres on the Bay opened in 2002 as Singapore’s top performing arts venue. Located along Marina Bay, it hosts everything from concerts to theatre. "It’s a place where everyone can experience the arts" [Esplanade], with free outdoor shows and stunning architecture that’s a treat for visitors.', 'Cultural', 'Singapore', 'Singapore', 2002),
('flyer','Singapore Flyer', 1.28930000, 103.86310000, 'Ride the Singapore Flyer, opened in 2008 as one of the world’s tallest observation wheels at 165 meters. Offering "unrivalled views of Marina Bay and beyond" [Singapore Flyer], it’s a 30-minute journey in air-conditioned capsules, perfect for spotting landmarks or even Malaysia on clear days. A must-do for panoramic city views!', 'Observation Wheel', 'Singapore', 'Singapore', 2008),
('fullerton_hotel','Fullerton Hotel', 1.28660000, 103.85280000, 'Stay or dine at The Fullerton Hotel, a neo-classical icon opened in 1928 as Singapore’s General Post Office. Transformed into a luxury hotel in 2001, it overlooks the Singapore River with "a rich heritage dating back to the colonial era" [Fullerton Hotels]. Its grand columns and history make it a perfect blend of past and present for visitors.', 'Hotel', 'Singapore', 'Singapore', 1928),
('helix_bridge','Helix Bridge', 1.28790000, 103.86060000, 'Stroll along The Helix Bridge, a futuristic pedestrian link opened in 2010, inspired by the DNA double helix. Connecting Marina Centre to Marina South, its "curved tubular steel structure" [Wikipedia] glows at night, offering stunning views of Marina Bay Sands. A favorite for evening walks and photography enthusiasts.', 'Bridge', 'Singapore', 'Singapore', 2010),
('jubilee_bridge','Jubilee Bridge', 1.28940000, 103.85400000, 'Cross the Jubilee Bridge, a sleek pedestrian path opened in 2015 to mark Singapore’s 50th independence anniversary. Linking the Esplanade to Merlion Park, it’s "a tribute to the nation’s journey" [National Library Board]. Enjoy riverfront views and photo ops with Marina Bay icons on this modern, symbolic walkway.', 'Bridge', 'Singapore', 'Singapore', 2015),
('lv_marina_bay','Louis Vuitton Marina Bay', 1.28390000, 103.85910000, 'Shop in style at Louis Vuitton Marina Bay Sands, a floating boutique opened in 2011 on a crystal pavilion. Designed like a luxurious yacht, it offers "an exclusive retail experience" [Louis Vuitton] with bay views. Even window-shoppers will love its unique architecture and prime Marina Bay location.', 'Retail', 'Singapore', 'Singapore', 2011),
('mbs','Marina Bay Sands Shoppes', 1.28380000, 103.86050000, 'Indulge at The Shoppes at Marina Bay Sands, a luxury mall opened in 2010. With designer stores, a canal for sampan rides, and a vast food court, it’s "a premier shopping destination" [Marina Bay Sands]. Its futuristic vibe and proximity to the casino make it a central stop for visitors.', 'Retail', 'Singapore', 'Singapore', 2010),
('mbs_hotel','Marina Bay Sands Hotel', 1.28410000, 103.86070000, 'Experience Marina Bay Sands Hotel, opened in 2010, famed for its rooftop SkyPark and infinity pool 57 stories up. Designed by Moshe Safdie, its three towers offer "a new level of luxury" [Marina Bay Sands] with over 2,500 rooms. A bucket-list stay with jaw-dropping views of the city and bay!', 'Hotel', 'Singapore', 'Singapore', 2010),
('merlion','Merlion', 1.28680000, 103.85450000, 'Meet the Merlion, Singapore’s iconic mascot unveiled in 1972, blending a lion’s head and fish’s body. Sculpted by Lim Nang Seng, this 8.6-meter statue spouts water into Marina Bay, symbolizing Singapore’s origins as a fishing village and lion city. "It’s a must-see national icon" [Visit Singapore]—perfect for that classic photo!', 'Monument', 'Singapore', 'Singapore', 1972),
('nat_gallery','National Gallery Singapore', 1.29030000, 103.85190000, 'Wander through the National Gallery Singapore, opened in 2015 in the former Supreme Court and City Hall, both from the 1930s. It houses "the world’s largest public collection of Singapore and Southeast Asian art" [National Gallery Singapore], blending colonial architecture with modern galleries. A gem for art and history lovers.', 'Museum', 'Singapore', 'Singapore', 2015),
('one_fullerton','One Fullerton', 1.28600000, 103.85430000, 'Dine with a view at One Fullerton, opened in 2000 on reclaimed land opposite the Fullerton Hotel. With waterfront eateries and bars, it’s "a vibrant lifestyle destination" [Wikipedia] near Marina Bay and the Merlion. Relax and soak in Singapore’s modern charm after exploring nearby heritage sites.', 'Commercial', 'Singapore', 'Singapore', 2000),
('sa_cathedral','St Andrew''s Cathedral', 1.29210000, 103.85210000, 'Visit St Andrew’s Cathedral, completed in 1861 in Gothic Revival style, named after Scotland’s patron saint. Replacing a lightning-damaged church, its "white facade and spire" [St Andrew’s Cathedral] offer serenity in the Civic District. A peaceful stop for history and architecture enthusiasts.', 'Religious', 'Singapore', 'Singapore', 1861),
('sg_river','Singapore River', 1.28890000, 103.85140000, 'Cruise the Singapore River, where Sir Stamford Raffles landed in 1819, sparking the city’s growth. Once a busy trade hub, it’s now a scenic waterway with "historic bridges and modern nightlife" [Wikipedia]. Take a bumboat ride to see its blend of past and present—a tourist favorite!', 'Natural', 'Singapore', 'Singapore', NULL),
('stamford_raffles_statue','Sir Stamford Raffles Statue', 1.28740000, 103.85190000, 'Pay respects at the Sir Stamford Raffles Statue, erected in 1887 to honor Singapore’s founder. Cast in bronze by Thomas Woolner, it stands near his 1819 landing site. "It marks the spot where modern Singapore began" [National Library Board]—a quick, meaningful stop for history fans.', 'Monument', 'Singapore', 'Singapore', 1887),
('the_arts_house','The Arts House', 1.28830000, 103.85130000, 'Step into The Arts House, built in 1827 as Singapore’s oldest surviving structure, originally a courthouse. Later the first Parliament House in 1954, it now hosts arts events with "a focus on literary arts" [The Arts House]. Its elegant design makes it a hidden cultural treasure.', 'Cultural', 'Singapore', 'Singapore', 1827),
('vic_concert_hall','Victoria Concert Hall', 1.28860000, 103.85160000, 'Enjoy a show at Victoria Theatre and Concert Hall, opened in 1905 as Victoria Memorial Hall to honor Queen Victoria. Home to the Singapore Symphony Orchestra, its "neo-classical architecture" [Victoria Theatre] shines after recent renovations. A must for music and history lovers!', 'Cultural', 'Singapore', 'Singapore', 1905);

INSERT INTO landmark_references (landmark_id, url, title, source) VALUES
(1, 'https://www.nhb.gov.sg/acm/', 'Asian Civilisations Museum', 'National Heritage Board'),
(2, 'https://en.wikipedia.org/wiki/Anderson_Bridge', 'Anderson Bridge', 'Wikipedia'),
(3, 'https://www.apple.com/sg/marina-bay-sands/', 'Apple Marina Bay Sands', 'Apple'),
(4, 'https://www.marinabaysands.com/museum.html', 'ArtScience Museum', 'Marina Bay Sands'),
(5, 'https://en.wikipedia.org/wiki/Cavenagh_Bridge', 'Cavenagh Bridge', 'Wikipedia'),
(6, 'https://eresources.nlb.gov.sg/infopedia/articles/SIP_100_2005-01-25.html', 'Dalhousie Obelisk', 'National Library Board'),
(7, 'https://www.esplanade.com/', 'Esplanade - Theatres on the Bay', 'Esplanade'),
(8, 'https://www.singaporeflyer.com/', 'Singapore Flyer', 'Singapore Flyer'),
(9, 'https://www.fullertonhotels.com/the-fullerton-hotel-singapore', 'The Fullerton Hotel Singapore', 'Fullerton Hotels'),
(10, 'https://en.wikipedia.org/wiki/The_Helix_Bridge', 'The Helix Bridge', 'Wikipedia'),
(11, 'https://eresources.nlb.gov.sg/infopedia/articles/SIP_2016-03-09_133827.html', 'Jubilee Bridge', 'National Library Board'),
(12, 'https://www.louisvuitton.com/sg-en/magazine/stores/singapore-marina-bay-sands', 'Louis Vuitton Marina Bay Sands', 'Louis Vuitton'),
(13, 'https://www.marinabaysands.com/shopping.html', 'The Shoppes at Marina Bay Sands', 'Marina Bay Sands'),
(14, 'https://www.marinabaysands.com/hotel.html', 'Marina Bay Sands Hotel', 'Marina Bay Sands'),
(14, 'https://en.wikipedia.org/wiki/Marina_Bay_Sands', 'Marina Bay Sands', 'Wikipedia'),
(14, 'https://www.visitsingapore.com/see-do-singapore/architecture/modern/marina-bay-sands/', 'Marina Bay Sands', 'Visit Singapore'),
(15, 'https://en.wikipedia.org/wiki/Merlion', 'Merlion', 'Wikipedia'),
(15, 'https://www.visitsingapore.com/see-do-singapore/landmarks-icons/merlion-park/', 'Merlion Park', 'Visit Singapore'),
(15, 'https://eresources.nlb.gov.sg/infopedia/articles/SIP_42_2004-12-13.html', 'Merlion', 'National Library Board'),
(16, 'https://www.nationalgallery.sg/', 'National Gallery Singapore', 'National Gallery Singapore'),
(17, 'https://en.wikipedia.org/wiki/One_Fullerton', 'One Fullerton', 'Wikipedia'),
(18, 'https://www.standrewscathedral.org.sg/', 'St Andrew''s Cathedral', 'St Andrew''s Cathedral'),
(19, 'https://en.wikipedia.org/wiki/Singapore_River', 'Singapore River', 'Wikipedia'),
(20, 'https://eresources.nlb.gov.sg/infopedia/articles/SIP_733_2005-01-13.html', 'Sir Stamford Raffles Statue', 'National Library Board'),
(21, 'https://www.theartshouse.sg/', 'The Arts House', 'The Arts House'),
(22, 'https://www.vtvch.com.sg/', 'Victoria Theatre and Concert Hall', 'Victoria Theatre');