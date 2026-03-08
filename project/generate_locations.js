import fs from 'fs';

const cities = [
    { name: "Chennai", lat: 13.0827, lng: 80.2707, count: 120 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558, count: 60 },
    { name: "Madurai", lat: 9.9252, lng: 78.1198, count: 50 },
    { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, count: 40 },
    { name: "Salem", lat: 11.6643, lng: 78.1460, count: 40 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946, count: 150 },
    { name: "Mysore", lat: 12.2958, lng: 76.6394, count: 50 },
    { name: "Mangalore", lat: 12.9141, lng: 74.8560, count: 40 },
    { name: "Hubli", lat: 15.3647, lng: 75.1240, count: 40 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, count: 120 },
    { name: "Warangal", lat: 17.9689, lng: 79.5941, count: 40 },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, count: 60 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, count: 60 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365, count: 40 },
    { name: "Kochi", lat: 9.9312, lng: 76.2673, count: 50 },
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, count: 50 },
    { name: "Kozhikode", lat: 11.2588, lng: 75.7804, count: 40 },
];

const junction_types = ["Main Square", "Crossroad", "Signal", "Circle", "Highway Intersection", "Toll Plaza", "Bypass", "Flyover Exit"];
const street_prefixes = ["MG Road", "Station Road", "Temple Road", "Market", "Ring Road", "Airport Road", "University Road", "Palace Road", "Central"];
const zones = ['A', 'B', 'C', 'North', 'South', 'East', 'West'];

const sql_statements = [];

for (const city of cities) {
    for (let i = 0; i < city.count; i++) {
        const lat_offset = (Math.random() * 0.16) - 0.08;
        const lng_offset = (Math.random() * 0.16) - 0.08;
        const lat = city.lat + lat_offset;
        const lng = city.lng + lng_offset;
        
        const j_type = junction_types[Math.floor(Math.random() * junction_types.length)];
        const route_num = Math.floor(Math.random() * 100) + 1;
        
        let j_name = "";
        if (Math.random() > 0.5) {
            const prefix = street_prefixes[Math.floor(Math.random() * street_prefixes.length)];
            j_name = `${city.name} ${prefix} ${j_type}`;
        } else {
            j_name = `${city.name} Sector ${route_num} ${j_type}`;
        }
            
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const location_desc = `${city.name} Zone ${zone}`;
        
        const sql = `  ('${j_name}', '${location_desc}', ${lat.toFixed(4)}, ${lng.toFixed(4)}, 'online')`;
        sql_statements.push(sql);
    }
}

const outputPath = "c:/Users/sashank anjani/Downloads/traffic management system/project/south_india_insert.sql";
const content = `INSERT INTO traffic_cameras (name, location, latitude, longitude, status) VALUES\n${sql_statements.join(",\n")};\n`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Successfully generated ${sql_statements.length} sql statements in ${outputPath}`);
