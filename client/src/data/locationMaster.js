/**
 * Client-Side Master Dataset of all 36 Indian States and Union Territories with official districts.
 * Guarantees instantaneous, zero-latency cascading state -> district filtering with zero cross-state contamination.
 */

export const INDIAN_STATES_AND_DISTRICTS = [
  {
    id: 'andaman-and-nicobar-islands',
    name: 'Andaman and Nicobar Islands',
    type: 'UT',
    districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman']
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    type: 'State',
    districts: [
      'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
      'Chittoor', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada',
      'Konaseema', 'Krishna', 'Kurnool', 'Nandyal', 'NTR',
      'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Srikakulam', 'Sri Potti Sriramulu Nellore',
      'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ]
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    type: 'State',
    districts: [
      'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
      'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit',
      'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai',
      'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang',
      'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
    ]
  },
  {
    id: 'assam',
    name: 'Assam',
    type: 'State',
    districts: [
      'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
      'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri',
      'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi',
      'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong',
      'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon',
      'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar',
      'Tinsukia', 'Udalguri', 'West Karbi Anglong'
    ]
  },
  {
    id: 'bihar',
    name: 'Bihar',
    type: 'State',
    districts: [
      'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai',
      'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran',
      'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
      'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura',
      'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada',
      'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
      'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
      'Supaul', 'Vaishali', 'West Champaran'
    ]
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    type: 'UT',
    districts: ['Chandigarh']
  },
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    type: 'State',
    districts: [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara',
      'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg',
      'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham',
      'Kanker', 'Khairagarh', 'Kondagaon', 'Korba', 'Koriya',
      'Mahasamund', 'Manendragarh', 'Mohla-Manpur', 'Mungeli', 'Narayanpur',
      'Raigarh', 'Raipur', 'Rajnandgaon', 'Sarangarh', 'Sukma',
      'Surajpur', 'Surguja'
    ]
  },
  {
    id: 'dadra-and-nagar-haveli-and-daman-and-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'UT',
    districts: ['Dadra and Nagar Haveli', 'Daman', 'Diu']
  },
  {
    id: 'delhi',
    name: 'Delhi',
    type: 'UT',
    districts: [
      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
      'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    type: 'State',
    districts: ['North Goa', 'South Goa']
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    type: 'State',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha',
      'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod',
      'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
      'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
      'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan',
      'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
      'Tapi', 'Vadodara', 'Valsad'
    ]
  },
  {
    id: 'haryana',
    name: 'Haryana',
    type: 'State',
    districts: [
      'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
      'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal',
      'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal',
      'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
      'Sonipat', 'Yamunanagar'
    ]
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    type: 'State',
    districts: [
      'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur',
      'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur',
      'Solan', 'Una'
    ]
  },
  {
    id: 'jammu-and-kashmir',
    name: 'Jammu and Kashmir',
    type: 'UT',
    districts: [
      'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda',
      'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam',
      'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban',
      'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
    ]
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    type: 'State',
    districts: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
      'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
      'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
      'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
      'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    type: 'State',
    districts: [
      'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
      'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
      'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
      'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
      'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir', 'Vijayanagara'
    ]
  },
  {
    id: 'kerala',
    name: 'Kerala',
    type: 'State',
    districts: [
      'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
      'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
      'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    type: 'UT',
    districts: ['Kargil', 'Leh']
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep',
    type: 'UT',
    districts: ['Lakshadweep']
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    type: 'State',
    districts: [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat',
      'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur',
      'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
      'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
      'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni',
      'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
      'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen',
      'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna',
      'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur',
      'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain',
      'Umaria', 'Vidisha'
    ]
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    type: 'State',
    districts: [
      'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed',
      'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
      'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
      'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
      'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani',
      'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
      'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ]
  },
  {
    id: 'manipur',
    name: 'Manipur',
    type: 'State',
    districts: [
      'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
      'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney',
      'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
    ]
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    type: 'State',
    districts: [
      'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills',
      'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills',
      'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
    ]
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    type: 'State',
    districts: [
      'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib',
      'Lawngtlai', 'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'
    ]
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    type: 'State',
    districts: [
      'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
      'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren',
      'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'
    ]
  },
  {
    id: 'odisha',
    name: 'Odisha',
    type: 'State',
    districts: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak',
      'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati',
      'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
      'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput',
      'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
      'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundergarh'
    ]
  },
  {
    id: 'puducherry',
    name: 'Puducherry',
    type: 'UT',
    districts: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam']
  },
  {
    id: 'punjab',
    name: 'Punjab',
    type: 'State',
    districts: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga',
      'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
      'Sangrur', 'Shahid Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'
    ]
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    type: 'State',
    districts: [
      'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara',
      'Baran', 'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara',
      'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa',
      'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur',
      'Ganganagar', 'Gangapur City', 'Hanumangarh', 'Hindaun', 'Jaipur',
      'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu',
      'Jodhpur', 'Jodhpur Rural', 'Karauli', 'Kekri', 'Khairthal-Tijara',
      'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali',
      'Phalodi', 'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore',
      'Sawai Madhopur', 'Shahpura', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur'
    ]
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    type: 'State',
    districts: ['Gangtok', 'Mangan', 'Namchi', 'Gyalshing', 'Pakyong', 'Soreng']
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    type: 'State',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
      'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
      'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
      'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
      'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
      'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
      'Vellore', 'Viluppuram', 'Virudhunagar'
    ]
  },
  {
    id: 'telangana',
    name: 'Telangana',
    type: 'State',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
      'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
      'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
      'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
      'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
      'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
      'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  },
  {
    id: 'tripura',
    name: 'Tripura',
    type: 'State',
    districts: [
      'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala',
      'South Tripura', 'Unakoti', 'West Tripura'
    ]
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    type: 'State',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha',
      'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich',
      'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly',
      'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
      'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah',
      'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad',
      'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur',
      'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
      'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
      'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
      'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut',
      'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
      'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
      'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
      'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ]
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    type: 'State',
    districts: [
      'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
      'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag',
      'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
    ]
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    type: 'State',
    districts: [
      'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
      'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
      'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
      'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur',
      'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ]
  }
];

export const getAllStates = () => {
  return INDIAN_STATES_AND_DISTRICTS.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
    districtCount: s.districts.length
  }));
};

export const getDistrictsForState = (stateNameOrId) => {
  if (!stateNameOrId) return [];
  const normalized = stateNameOrId.trim().toLowerCase();
  const slug = normalized.replace(/\s+/g, '-');
  const found = INDIAN_STATES_AND_DISTRICTS.find(
    s => s.name.toLowerCase() === normalized || s.id === slug
  );
  return found ? [...found.districts] : [];
};

export const isValidDistrict = (stateName, districtName) => {
  if (!stateName || !districtName) return false;
  const list = getDistrictsForState(stateName);
  return list.some(d => d.toLowerCase() === districtName.trim().toLowerCase());
};
