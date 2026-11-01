/* concepts.js — Technology 2D Vector Concept Generator
   Setiap konsep berasal dari "blueprint" teknologi yang ditulis manual (objek, fungsi, komponen,
   gerak, urutan), lalu dikombinasikan dengan gaya, palet, dan tata letak. Bukan kata acak. */
const CE = (() => {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const CATS = [
    ['ai', 'Artificial Intelligence & Machine Learning', 'artificial intelligence and machine learning'],
    ['semi', 'Semiconductor & Microelectronics', 'semiconductors and microelectronics'],
    ['cloud', 'Cloud Computing & Data Centers', 'cloud computing and data centers'],
    ['cyber', 'Cybersecurity & Digital Privacy', 'cybersecurity and digital privacy'],
    ['robot', 'Robotics & Industrial Automation', 'robotics and industrial automation'],
    ['quantum', 'Quantum Computing', 'quantum computing'],
    ['bio', 'Biotechnology & Medical Technology', 'biotechnology and medical technology'],
    ['space', 'Satellite & Space Technology', 'satellite and space technology'],
    ['telecom', 'Telecommunications & 5G/6G', 'telecommunications and 5G/6G networks'],
    ['auto', 'Autonomous Vehicles & Smart Mobility', 'autonomous vehicles and smart mobility'],
    ['city', 'Smart City & Internet of Things', 'smart cities and the Internet of Things'],
    ['energy', 'Renewable Energy & Smart Grid', 'renewable energy and smart grids'],
    ['xr', 'Augmented Reality & Virtual Reality', 'augmented and virtual reality'],
    ['hw', 'Computer Hardware & Electronics', 'computer hardware and electronics'],
    ['soft', 'Software Engineering & Programming', 'software engineering and programming'],
    ['data', 'Data Science & Big Data', 'data science and big data'],
    ['infra', 'Digital Infrastructure & Networking', 'digital infrastructure and networking'],
    ['mfg', 'Advanced Manufacturing & 3D Printing', 'advanced manufacturing and 3D printing'],
    ['sci', 'Scientific Instruments & Research Technology', 'scientific instruments and research technology'],
    ['future', 'Future Technology & Emerging Innovations', 'future technology and emerging innovations']
  ];

  const MOTIONS = {
    'circuit signal propagation': 'pulses of light travel along traces in staggered waves, lighting each junction as it activates',
    'mechanical component assembly': 'parts slide, drop and lock into place one after another until the assembly is complete',
    'sensor scanning': 'a scan line or cone sweeps across the subject while detected features highlight in turn',
    'robotic articulation': 'linked arm segments pivot through joint angles along eased, coordinated paths',
    'data packet routing': 'discrete packets travel through nodes and switches along chosen routes, splitting and merging',
    'semiconductor manufacturing': 'a wafer or die advances through process stations where layers are deposited, exposed and etched in sequence',
    'laser inspection': 'a thin laser line traces the part while defect markers appear and are cleared',
    'satellite orbital movement': 'bodies travel along elliptical orbits at different periods while links and beams connect them',
    'network synchronization': 'nodes pulse out of phase at first, then converge into a shared rhythm',
    'energy transfer': 'charge flows as moving segments along conduits, filling storage and driving loads',
    'scientific measurement': 'an instrument probe moves to sample points while a result trace is drawn',
    'optical detection': 'light rays pass through lenses and strike a detector that responds when aligned',
    'automated calibration': 'actuators adjust in small steps until reference marks align and indicators settle',
    'digital system initialization': 'modules power up in dependency order, each confirming with a state change before the next starts',
    'molecular transport': 'carriers drift along channels and release their cargo when they dock with a matching target',
    'progressive construction': 'lines and shapes are drawn stroke by stroke until the structure is complete'
  };

  const LAYOUTS = {
    lane: ['a left-to-right process lane with three stations', 'a diagonal assembly line rising to the right'],
    hero: ['a centred hero device with symmetric supporting elements', 'an off-centre hero device with generous negative space'],
    hub: ['a radial hub with spokes to satellite nodes', 'layered network tiers from top to bottom'],
    cut: ['a side cutaway section revealing the internal parts', 'a split view with the exterior on the left and the internal mechanism on the right'],
    grid: ['a top-down schematic laid out on a modular grid', 'a layered plan view with clearly separated levels'],
    orbit: ['orbital paths around a central body', 'a wide landscape with objects moving on curved routes']
  };

  // sub|objek utama|fungsi|komponen|gerak|tata letak (~ = cocok untuk loop)|urutan (3 babak, dipisah " ; ")
  const RAW = {
    ai: `
Neural Network Training Loop|a layered neural network drawn as columns of nodes|learns by adjusting connection weights after comparing its output with a target|input node column, hidden layers, weighted connections, output nodes, error meter bar|network synchronization|hub~|signals flow left to right through the layers ; the output is compared with the target and the error pulses back along the connections ; weights thicken or thin until the output matches
Image Recognition Pipeline|a camera feeding a convolutional feature extractor|identifies an object by extracting edges, shapes and finally a class|camera module, photo frame, filter grids, feature map stack, class selector|sensor scanning|lane|a photo frame arrives and a scan window slides over it ; filter grids produce stacked feature maps that grow more abstract ; a class selector lights the matching icon
Training Data Labeling Station|a robotic arm sorting raw samples into labelled bins|prepares labelled datasets for supervised learning|unlabelled sample cards on a conveyor, sorting arm, label stamp, three coloured bins, quality gate|robotic articulation|lane|unlabelled cards ride the conveyor ; the arm picks each card, the stamp tags it and it drops into the matching bin ; the quality gate rejects one mislabelled card and the bins fill
GPU Inference Accelerator|a GPU card with a grid of compute cores on its die|runs many small calculations in parallel to answer model requests|GPU board, fan and heatsink, core grid, memory modules, request queue lane|circuit signal propagation|cut|request tokens queue and enter the die ; waves of activity sweep across the core grid and memory modules ; results leave as completed tokens while the fan spins
Autonomous Decision Tree|a branching decision tree on a clean board|chooses an action by testing conditions along its branches|root node, branching paths, condition gates, leaf outcome tiles, moving decision token|data packet routing|hub|a token enters at the root and meets the first gate ; each gate switches its path and the token follows the matching branch ; the token reaches a leaf and the chosen outcome tile lights
Edge AI Camera Module|a compact smart camera with an onboard AI chip|detects events locally without sending raw video to the cloud|lens barrel, image sensor, AI chip, status lamp, outgoing event packet|optical detection|hero|light enters the lens and hits the sensor ; the AI chip activates and outlines a detected shape ; only a tiny event packet leaves the device`,
    semi: `
Wafer Photolithography Exposure|a silicon wafer under a lithography lens|transfers a circuit pattern onto the wafer with light through a mask|wafer disc, photomask plate, projection lens, light beam, stage rails|semiconductor manufacturing|cut|the stage slides the wafer under the lens ; light passes through the mask and exposes one die at a time ; the stage steps to the next die until the wafer is patterned
Chip Scanning and Inspection Machine|an inspection machine with a chip on a tray|checks a chip for defects with a sensor sweep|machine housing, chip tray, scanning sensor head, scan path guide rails, defect marker flags|laser inspection|hero|the tray carries the chip under the sensor head ; the head sweeps a scan path across the chip and highlights suspect spots ; a marker flags one defect and the tray moves the chip to the pass or reject lane
Die and Wire Bonding Cell|a bonding arm placing a die onto a package|attaches a die to a package and wires its pads|package substrate, die, bonding arm with capillary, gold wire loops, pad row|mechanical component assembly|cut|the arm picks the die and sets it on the substrate ; the capillary draws wire loops from pad to pad ; the finished package slides out
Wafer Dicing Saw|a circular saw cutting a wafer into dies|separates a wafer into individual dies|wafer on a frame, saw blade, cutting street grid, coolant jet, die tray|semiconductor manufacturing|lane|the blade aligns to the first street ; it cuts line after line across the wafer ; the separated dies are picked into the tray
Transistor Gate Switching Cross-Section|a cross-section of a transistor on a silicon slab|switches current on and off with a voltage on its gate|source and drain regions, channel, gate and insulator layer, charge carrier dots, voltage indicator|energy transfer|cut~|the gate voltage rises and a channel forms ; carriers flow from source to drain ; the voltage drops and the channel closes
Packaged Chip Test Handler|a handler testing packaged chips on a rotary turret|sorts packaged chips by electrical test result|rotary turret, pickup nozzles, test socket, input tray, pass and fail bins|robotic articulation|lane|nozzles pick chips from the input tray ; the turret indexes each chip into the test socket ; chips drop into the pass or fail bins`,
    cloud: `
Server Rack Cooling Airflow|a row of server racks with cold and hot aisles|keeps servers cool by directing airflow|server racks, cold aisle air streams, hot aisle exhaust, cooling unit, temperature indicator|energy transfer|cut~|cool air streams enter the front of the racks ; warm air rises out of the back to the cooling unit ; the cooling unit returns cold air in a continuous cycle
Cloud Autoscaling Cluster|a cluster of virtual machine blocks behind a load balancer|adds and removes capacity as traffic changes|load balancer, request stream, server blocks, scaling controller, traffic wave|data packet routing|hub|requests arrive in a growing wave ; the controller adds new server blocks that join the pool ; as traffic falls the extra blocks fade away
Cross-Region Data Replication|three regional data centers linked by routes|keeps copies of data in sync across regions|three data center buildings, region plates, data blocks, replication links, sync check marks|network synchronization|hub|a data block is written in the primary center ; copies travel along links to the other regions ; check marks confirm all three match
Storage Tiering Robot Library|a tape and disk storage library with a picker robot|moves data between fast and cold storage|disk shelf, tape cartridge slots, picker robot on a rail, hot-tier SSD tray, data cartridge|robotic articulation|cut|the picker travels along the rail ; it moves a cartridge from the hot tray to a cold slot ; another cartridge returns to the hot tier
Container Orchestration Scheduler|container blocks being placed onto node machines|schedules containers onto healthy machines|node machines, container blocks, scheduler pointer, health lamps, replacement container|mechanical component assembly|grid|containers queue and the scheduler assigns each to a node ; one node fails and its lamp turns red ; the scheduler moves its containers to healthy nodes
Content Delivery Network Caching|an origin server and edge servers around a region map|serves content from nearby edge caches|origin server, edge cache nodes, user device icons, content block, route lines|data packet routing|hub|a user requests content and the edge node has none ; the edge fetches it from the origin and keeps a copy ; the next user is served instantly from the edge`,
    cyber: `
Firewall Packet Filtering|a firewall gate on a network line|allows safe traffic and blocks malicious packets|incoming packet stream, firewall gate with rule slots, safe packets, malicious packets, protected network zone|data packet routing|lane~|packets approach the gate ; the gate scans each against its rules ; safe packets pass while red packets bounce away
Encryption Key Exchange|a padlock and two devices exchanging keys|protects data by locking it with a key only the receiver holds|sender device, receiver device, data block, public and private key shapes, padlock|data packet routing|lane|a data block is locked with a key shape ; the locked block crosses the network ; the receiver key opens the lock and the data is restored
Intrusion Detection Radar|a radar-style network monitor|spots abnormal activity in network traffic|circular scope, sweep arm, normal traffic dots, anomaly blip, alert marker|sensor scanning|orbit~|the sweep arm circles the scope over steady traffic dots ; an anomaly blip appears and the marker locks on ; the threat is isolated and calm returns
Biometric Access Gate|a fingerprint scanner beside a door|verifies identity before opening a door|fingerprint pad, scan line, door panels, status lamp, user outline|sensor scanning|hero|a finger meets the pad and the scan line sweeps ; the pattern matches a stored template ; the lamp turns green and the door panels slide open
Password Hashing Vault|a vault door receiving a password that becomes a hash|stores passwords as irreversible hashes|password block, hashing machine, scrambled hash blocks, vault door, comparison gate|mechanical component assembly|lane|a password block enters the hashing machine ; it emerges as a scrambled hash block ; the vault stores only the hash and the comparison gate matches later attempts
VPN Tunnel Privacy|a tunnel carrying data between a device and a server|hides traffic from observers on the public network|device, tunnel pipe, encrypted data blocks, observers with blocked view, destination server|data packet routing|lane~|data blocks enter the tunnel as locked shapes ; observers outside see only a blur of blocks ; the blocks exit at the server and unlock`,
    robot: `
Six-Axis Robot Arm Pick and Place|a six-axis industrial arm beside a conveyor|moves parts from an input belt to a packing tray|robot base, arm segments with joints, gripper, conveyor belt, parts, packing tray|robotic articulation|lane~|parts arrive on the belt ; the arm swings, grips and lifts one part ; it places the part in the tray and returns
Automated Welding Cell|a welding robot over two metal panels|joins metal panels with precise weld seams|welding torch arm, metal panels, fixture clamps, spark bursts, seam line|robotic articulation|cut|clamps hold the panels ; the torch follows the seam path with sparks ; the clamps release and the finished seam glows then cools
Warehouse Sorting Robots|small robots carrying parcels across a grid floor|sorts parcels to destination chutes|grid floor, mobile robots, parcels, destination chutes, charging station|data packet routing|grid~|robots pick up parcels at the loading edge ; they travel the grid avoiding each other ; each drops its parcel into the matching chute
Robotic Vision Quality Check|a camera gantry above a production line|rejects defective items using machine vision|conveyor, products, camera gantry, frame outlines, reject pusher|optical detection|lane~|products pass under the camera ; a frame outlines each item and checks it ; the pusher knocks out a defective item
Collaborative Robot Assembly Station|a cobot arm at a workstation|assembles a small device alongside workers|cobot arm, parts tray, fixture, screwdriver tool, finished device|mechanical component assembly|hero|the cobot picks parts from the tray ; it fits and fastens the parts on the fixture ; the finished device is lifted out
Autonomous Mobile Robot Docking|a mobile robot returning to its charging dock|navigates to a dock and charges|mobile robot body, route line, obstacle blocks, charging dock, battery indicator|automated calibration|grid|the robot leaves its station along a route ; it detours around an obstacle ; it aligns with the dock and the battery indicator fills`,
    quantum: `
Qubit Superposition Sphere|a Bloch sphere drawn with a state arrow|shows a qubit state moving between zero and one|sphere outline, state arrow, axis lines, probability arc, measurement marker|scientific measurement|orbit~|the arrow rests at the pole ; it rotates into superposition around the sphere ; a measurement collapses it to one pole
Dilution Refrigerator Cooling Stages|a stacked chandelier-style cryostat|cools a quantum chip to near absolute zero|stacked plates, cable bundles, quantum chip at the bottom, stage temperature markers, vacuum can|energy transfer|cut|the stack lowers its stage markers from warm to cold ; cables settle at each plate ; the chip glows at the coldest stage
Quantum Gate Circuit|horizontal qubit lines with gate boxes|applies gates to qubits to run a quantum algorithm|qubit lines, gate boxes, control dots, entanglement links, measurement meters|circuit signal propagation|lane|a pulse travels along the qubit lines ; gates and control links activate in sequence ; the measurement meters settle on the result
Entanglement Link|two qubits connected across a gap|keeps two qubits correlated even when separated|two qubit orbs, link wave, separation gap, measurement markers, state arrows|network synchronization|orbit~|two orbs pulse out of phase ; a link wave joins them and their pulses lock together ; one is measured and the other shows the matching state
Trapped Ion Chip|ions held above a chip by electrodes|manipulates ions with lasers|electrode strip, ion beads, laser beams, vacuum chamber outline, readout detector|optical detection|cut|ions line up above the electrodes ; laser beams touch ions to change their state ; the detector reads which ions glow
Superconducting Qubit Readout|a resonator and qubit on a chip|reads a qubit state with a microwave pulse|chip outline, qubit island, resonator line, microwave pulse wave, readout amplifier|scientific measurement|cut|a microwave pulse travels the resonator ; the pulse shifts depending on the qubit state ; the amplifier raises the signal and the state is read`,
    bio: `
DNA Sequencer Flow Cell|a flow cell chip carrying DNA strands|reads the order of DNA bases|flow cell channel, DNA strand shapes, colour-coded base markers, optical reader, read-out trace|optical detection|lane|strands enter the channel ; the reader flashes colour markers base by base ; a read-out trace builds the sequence
MRI Scanner Imaging|a ring-shaped scanner with a patient bed|builds cross-section images of the body|scanner ring, patient bed on rails, magnet coil outline, signal waves, slice image frame|sensor scanning|hero|the bed slides into the ring ; coil waves pulse and sweep through slices ; slice images appear one by one
Robotic Surgery Console|a robotic arm cart with instrument tips|performs minimally invasive surgery with precise instrument control|robot arm cart, instrument shafts, surgeon console outline, small incision site, motion scaling indicator|robotic articulation|hero|the surgeon hands move at the console ; the arms mirror the motion in smaller precise steps ; the instruments complete a suture stitch
PCR Thermal Cycler|a thermal cycler block with sample tubes|copies DNA by repeating heating and cooling cycles|heating block, sample tubes, temperature curve line, doubling DNA copies, lid|automated calibration|cut~|the block heats and the strands separate ; it cools and primers attach ; copies double each cycle
Drug Delivery Nanocapsule|a nanocapsule travelling through a blood vessel|delivers medicine to target cells|vessel walls, capsule with targeting markers, target cell, drug particles, healthy cells|molecular transport|lane|the capsule drifts along the vessel past healthy cells ; its markers match the target cell and it docks ; it opens and releases particles into the cell
Smart Insulin Pump Monitor|a wearable pump with a glucose sensor|adjusts medicine doses from sensor readings|sensor patch, pump body, dose cartridge, sensor reading wave, dose arrow|automated calibration|hero~|the sensor reading rises ; the pump advances a small dose ; the reading settles back to the target band`,
    space: `
Satellite Deployment and Panel Unfolding|a satellite leaving a rocket stage|unfolds panels and antennas to start operating|satellite body, folded solar panels, antenna dish, rocket adapter ring, thruster puffs|mechanical component assembly|hero|the satellite separates from the adapter ring ; panels unfold segment by segment ; the dish rotates toward Earth and the status lamp turns on
GPS Constellation Positioning|satellites around Earth sending signals to a receiver|determines a location from timing signals of several satellites|Earth disk, four satellites on orbits, signal rings, ground receiver, position marker|satellite orbital movement|orbit~|satellites glide along their orbits ; signal rings reach the receiver ; the position marker locks where the rings intersect
Earth Observation Imaging Pass|an imaging satellite scanning a ground strip|captures images of land as it passes overhead|Earth curve, satellite with camera, ground swath strip, image tiles, ground station|sensor scanning|orbit|the satellite moves along its orbit ; a swath strip sweeps over the land ; image tiles stack up and are sent to the ground station
Space Station Docking Approach|a cargo capsule approaching a station port|aligns and docks with a station|station module, docking port ring, cargo capsule, alignment markers, thruster bursts|automated calibration|hero|the capsule approaches and its markers align with the port ; small thrusters correct the drift ; the capsule docks and the latches close
Deep Space Antenna Link|a ground dish and a distant probe|keeps contact with a probe across millions of kilometres|ground dish, signal arcs, probe, star field, delay marker|network synchronization|orbit|the dish points toward the probe ; signal arcs travel the long gap ; the probe replies and the link indicator locks
Rocket Stage Separation|a two-stage rocket in ascent|drops a spent stage and ignites the next|first stage, second stage, interstage ring, engine flames, separation bolt flashes|mechanical component assembly|lane|the first stage burns and the vehicle climbs ; bolts fire and the stages separate ; the second stage ignites and continues upward`,
    telecom: `
5G Beamforming Base Station|a tower with a phased array panel|steers radio beams toward moving users|tower, antenna array panel, beam shapes, user devices, signal bars|network synchronization|hub|the array forms a beam toward one device ; the device moves and the beam follows ; a second beam serves another device without interference
Fiber Optic Light Transmission|a fiber cable cross-section with light pulses|carries data as pulses of light with minimal loss|fiber core, cladding layer, light pulses, transmitter laser, receiver photodiode|optical detection|lane~|the transmitter emits pulses ; pulses reflect along the core without leaking ; the receiver converts them back into signals
Network Switch Packet Forwarding|a rack switch with ports and cables|forwards packets to the right port|switch body, port row, cables, incoming packets, address table lights|data packet routing|hero~|packets arrive on one port ; the table lights show the matching port ; packets leave through the correct cable
Cellular Handover|a phone moving between two towers|keeps a call connected while moving between cells|two towers, coverage circles, moving vehicle with phone, signal links, handover marker|network synchronization|lane|the phone links to the first tower ; it enters the overlap and both links glow ; the link switches to the second tower smoothly
Submarine Cable Link|a cable crossing the ocean floor to a landing station|connects continents with undersea cable|ocean floor profile, cable, repeater units, landing station, signal pulses|energy transfer|lane~|pulses leave one landing station ; repeaters boost them along the seabed ; the other station receives them
Wi-Fi Access Point Airtime Sharing|an access point serving several devices|shares airtime efficiently among many devices|access point, device icons, channel slices, time slots, signal rings|network synchronization|hub~|the access point splits its channel into slices ; each device gets a slot in turn ; slots rotate and every device stays connected`,
    auto: `
Lidar Sensing Car|a car with a roof lidar unit|detects its surroundings with laser pulses|car body, roof lidar unit, laser rings, pedestrian and obstacle outlines, detection boxes|sensor scanning|hero|rings of pulses spread from the roof ; obstacles are outlined with boxes as pulses return ; the car chooses a clear path
Lane Keeping Steering Correction|a car following a curved lane|keeps the vehicle centred in its lane|car, lane lines, camera view cone, steering indicator, correction arrows|automated calibration|lane~|the camera cone locks onto the lane lines ; the car drifts and correction arrows appear ; steering returns it to the centre
Electric Vehicle Fast Charging|an electric car plugged into a fast charger|charges a battery quickly|charger pedestal, cable and plug, battery cutaway, battery cells, charge flow dots|energy transfer|cut|the plug connects and the lamp lights ; charge dots flow into the battery cells ; the cells fill and the plug releases
Smart Intersection Coordination|vehicles and a signal controller at a crossing|coordinates vehicles to cut waiting time|crossroad plan view, vehicles, signal lights, controller node, vehicle-to-infrastructure links|network synchronization|grid~|vehicles approach and link to the controller ; lights adapt to the flow ; vehicles pass in an interleaved pattern
Delivery Drone Landing|a drone landing on a pad with a parcel|delivers a parcel to a landing pad|drone body with rotors, parcel, landing pad markers, descent path, wind lines|automated calibration|hero|the drone descends along its path ; it aligns with the pad markers ; it releases the parcel and lifts away
Vehicle Battery Swap Station|a station swapping a battery pack under a car|replaces a depleted battery with a charged one|car chassis outline, battery pack, lift platform, charged pack rack, locking clamps|mechanical component assembly|cut|the platform rises under the car ; the old pack is unlocked and lowered ; a charged pack is lifted in and locked`,
    city: `
Smart Streetlight Network|streetlights with sensors along a road|adjusts lighting to traffic and links to a hub|streetlight poles, motion sensors, light cones, small hub node, passing vehicles|network synchronization|lane~|a vehicle approaches and the lights ahead brighten ; sensors pass the news along the chain ; lights dim again behind it
Water Leak Detection Network|pipes under a street with sensors|finds a leak from pressure changes|pipe network, pressure sensors, leak spot, signal pulses, repair crew marker|sensor scanning|cut|sensors send steady pulses ; a pressure drop appears near one section ; the leak location is pinpointed and the marker arrives
Waste Bin Fill Sensing|bins with fill sensors and a collection truck|routes trucks only to full bins|bins with level sensors, level bars, truck, route line, city blocks|data packet routing|grid|bins fill at different rates ; full bins send signals ; the truck route connects only the full bins
Smart Parking Guidance|a parking lot with occupancy sensors|guides drivers to free spaces|parking bays, sensors, entrance gate, guidance arrows, cars|data packet routing|grid|sensors mark which bays are occupied ; guidance arrows light a path to a free bay ; a car follows the arrows and parks
Air Quality Monitoring Station|a pole-mounted air sensor|measures pollutants and reports them|sensor pole, air intake, particle dots, reading trace, wireless link|scientific measurement|hero~|air carries particles toward the intake ; the sensor counts them and the trace rises ; the link sends the reading to the city hub
Smart Building Energy Management|a building cutaway with sensors|reduces energy use based on occupancy|building floors, occupancy sensors, lighting and cooling units, controller node, energy flow lines|energy transfer|cut|rooms fill and empty through the day ; the controller dims empty rooms and eases cooling ; energy flow lines shrink where use drops`,
    energy: `
Wind Turbine Power Generation|a wind turbine with a cutaway nacelle|turns wind into electricity|tower, rotor blades, nacelle cutaway, gearbox and generator, power line|energy transfer|cut~|wind lines push the blades round ; the shaft turns the generator ; power flows down the tower to the line
Solar Tracker Array|solar panels tilting toward the sun|keeps panels facing the sun to harvest more power|panel rows, tracker motors, sun path arc, inverter box, power flow dots|automated calibration|lane~|the sun moves along its arc ; trackers tilt the panels to follow ; power dots flow to the inverter
Battery Energy Storage Cycle|a battery container with cell modules|stores surplus energy and releases it at peak demand|battery container cutaway, cell modules, charge level bar, grid connection, demand curve|energy transfer|cut~|surplus power flows in and the level rises ; demand peaks ; stored energy flows out and the level falls
Smart Grid Load Balancing|a grid map with generators and consumers|balances supply and demand across the grid|power plant, wind farm, solar farm, substations, neighbourhood loads, balance indicator|network synchronization|hub~|loads change around the grid ; the balance indicator tips ; sources ramp up or down until it levels
Hydrogen Electrolyzer Stack|an electrolyzer stack producing gas|splits water into hydrogen and oxygen using electricity|water tank, cell stack, power input, hydrogen and oxygen bubble streams, storage tank|energy transfer|cut|water flows into the stack ; power drives bubbles of two gases from separate sides ; hydrogen fills the storage tank
Hydroelectric Dam Turbine|a dam cross-section with a turbine|generates power from falling water|reservoir, dam wall, penstock pipe, turbine, generator, outflow river|energy transfer|cut~|water enters the penstock ; it spins the turbine ; the generator sends power to the grid while the water exits`,
    xr: `
AR Headset Spatial Mapping|a headset scanning a room|maps surfaces so virtual objects can sit on them|headset, room corner outline, flat scan grid lines, anchor point, virtual object card|sensor scanning|hero|the headset sweeps the room ; flat grid lines appear on surfaces ; a virtual object snaps onto the table anchor
VR Controller Motion Tracking|a headset and controllers with tracking cameras|tracks hand position in space|headset, two controllers, tracking cameras, infrared dots, position trails|optical detection|hero|cameras emit infrared dots ; controllers reflect them and trails follow movement ; the tracked positions match the hand paths
Mixed Reality Guidance Overlay|a tablet view overlaying an outline on a real scene|overlays guidance on a real scene|tablet frame, camera view, outline layers, guidance markers, alignment crosshair|automated calibration|hero|the camera view locks onto a landmark ; overlay layers align with the crosshair ; guidance markers appear along the path
AR Floor Plane Detection|a phone placing a virtual object on a floor|places a virtual object on a real floor|phone frame, floor plane grid, plane detection dots, virtual object, contact shadow|sensor scanning|hero|the phone scans the floor and dots detect a plane ; the grid settles ; the virtual object drops and stays anchored
VR Headset Lens Optics|a headset lens cutaway|bends light so a screen fills the eye's view|display panel, lens, eye outline, light rays, field of view cone|optical detection|cut|rays leave the panel and bend at the lens ; they converge toward the eye ; the field of view cone opens to fill the view
Haptic Glove Feedback|a glove with finger actuators|lets users feel virtual objects|glove outline, finger actuators, virtual object, contact points, force bars|robotic articulation|hero|the glove fingers close toward a virtual object ; actuators push back at contact points ; force bars show the grip pressure`,
    hw: `
Motherboard Boot Signal Path|a motherboard with CPU, memory and storage|powers up and starts the system in order|board outline, CPU socket, memory slots, storage connector, power rail traces|digital system initialization|grid|power rails light up ; the CPU wakes and queries memory ; storage responds and the board status settles
SSD Data Write Flow|an SSD with a controller and flash chips|writes data across flash chips|SSD board, controller chip, flash chips, data blocks, wear-leveling pointer|data packet routing|hero~|data blocks arrive at the controller ; it spreads them across flash chips ; the pointer moves to even out wear
CPU Heat Pipe Cooling|a heat pipe cooler on a CPU|moves heat away from the processor|CPU, copper heat pipes, fin stack, fan, heat wave lines|energy transfer|cut~|heat waves rise from the CPU ; they travel through the pipes to the fins ; the fan carries them away
PCB Pick-and-Place Assembly|a machine placing components on a board|places surface-mount components precisely|bare board, placement head with nozzle, component reels, placed components, vision camera|mechanical component assembly|lane|the head picks a part from the reel ; the camera checks alignment ; the head places the part on its pad and repeats
Keyboard Switch Mechanism|a cutaway of a key switch|registers a key press|keycap, stem, spring, contact plates, signal pulse|circuit signal propagation|cut~|the keycap presses down and the spring compresses ; contacts meet and a pulse fires ; the key rises and the contacts part
Display Panel Layer Stack|an exploded 2D layer view of a display|forms an image from light and filters|backlight layer, polarizer, liquid crystal layer, colour filter, pixel grid|optical detection|cut|light enters at the back ; crystals twist and pass different amounts through the colour filter ; pixels build up a small image`,
    soft: `
Continuous Integration Pipeline|a pipeline of stations for code changes|builds, tests and ships code automatically|commit blocks, build station, test station, release gate, deployed servers|digital system initialization|lane|a commit block enters the build station ; tests run and a failing block is sent back ; a passing block clears the gate and reaches the servers
Compiler Translation Stages|machine stages translating source into machine code|turns readable code into machine instructions|source block, tokenizer, syntax tree shape, optimizer, machine code blocks|mechanical component assembly|lane|the source block is cut into tokens ; the tokens form a tree and are tidied ; machine code blocks roll out
API Request Response Cycle|a client and a server exchanging messages|fetches data through a request and a response|client device, request packet, API gateway, server, database, response packet|data packet routing|lane~|the client sends a request ; the gateway routes it to the server and database ; a response packet returns to the client
Version Control Branching|branches of a code history|lets teams work in parallel and merge changes|main line, branch lines, commit dots, merge junctions, conflict marker|progressive construction|lane|the main line grows with commit dots ; a branch splits off and grows its own commits ; the branch merges back at a junction
Microservices Orchestration|small service blocks connected by lines|splits an application into independent services|service blocks, message lines, gateway, database cylinders, scaling copies|network synchronization|hub~|a request enters the gateway ; it fans out to several services ; replies merge back and a busy service gains a copy
Debugger Step-Through|a code flow track with an execution pointer|finds a fault by stepping through execution|instruction blocks on a track, execution pointer, breakpoint markers, variable slots, bug marker|sensor scanning|lane|the pointer steps along the track and pauses at a breakpoint ; a variable slot shows a wrong value ; the faulty block is replaced and the pointer runs on`,
    data: `
ETL Data Pipeline Factory|raw data crates moving through machines|extracts, cleans and loads data|source crates, extraction arm, cleaning filter, transform press, warehouse shelf|mechanical component assembly|lane|crates of mixed data arrive ; the filter removes bad items and the press reshapes them ; clean blocks stack on the warehouse shelf
Clustering Algorithm Grouping|dots forming groups|groups similar points automatically|scattered point dots, centroid markers, group boundaries, movement trails, group colours|automated calibration|grid|dots start scattered ; centroids pull toward the dots nearest them ; groups settle into colours
Distributed Data Processing|a cluster splitting a large file|processes huge data by splitting work across machines|large data block, splitter, worker machines, partial result blocks, merger|data packet routing|hub|a large block is split into chunks ; workers process their chunks in parallel ; partial results merge into one result
Time Series Forecasting Engine|a model machine extending a line into the future|predicts future values from history|past value line, window frame, model gear, forecast path, soft confidence band|scientific measurement|lane|the line draws across the past ; the model gear turns inside the window ; a forecast path extends with a soft band
Data Warehouse Retrieval Robot|a warehouse with shelves and a retrieval robot|finds the requested records quickly|shelf columns, index tags, retrieval robot, query beam, results tray|robotic articulation|cut|the query beam selects a shelf column ; the robot travels to the matching tags ; matching records arrive in the tray
Stream Processing Sensor Feed|sensor events flowing through a processor|processes events as they arrive|sensor sources, event dots, windowing gate, aggregator, alert lamp|data packet routing|lane~|events stream from the sources ; the gate groups them into windows ; the aggregator outputs a summary and the lamp reacts to a spike`,
    infra: `
DNS Lookup Resolution|a request following a chain of servers|turns a name into an address|client, resolver, root server, domain server, address tag|data packet routing|lane|the client asks the resolver ; the resolver queries the servers in a chain ; the address tag returns to the client
Load Balancer Traffic Distribution|a balancer spreading requests|spreads traffic across servers|load balancer, request stream, server column, health lamps, queue meters|data packet routing|hub~|requests pour into the balancer ; they spread across the servers evenly ; one unhealthy server is skipped
Internet Exchange Peering|networks meeting at a shared switch|exchanges traffic directly between networks|three network clouds, exchange switch, peering links, traffic flows, status lamps|network synchronization|hub|networks connect to the switch ; links establish and glow ; traffic flows directly between them
Data Center Power Redundancy|power sources feeding a facility|keeps servers running during an outage|grid feed, generator, UPS battery, transfer switch, server hall|energy transfer|lane|grid power feeds the hall ; the grid drops and the UPS takes over instantly ; the generator starts and takes the load
Patch Panel Cable Management|a patch panel with cables moving|connects ports in a managed way|patch panel, ports, cables, switch ports, link lamps|mechanical component assembly|hero|cables plug into ports one by one ; link lamps turn on in order ; a cable moves to a new port and its lamp follows
Zero Trust Access Checkpoints|checkpoints between users and applications|verifies every request before granting access|user device, identity checkpoint, device check, policy gate, application vault|sensor scanning|lane|a request meets the identity checkpoint ; the device check scans and the policy gate evaluates ; access opens only to the one application`,
    mfg: `
FDM 3D Printer Layer Building|a printer extruder building an object|builds an object layer by layer|printer frame, extruder head, filament spool, heated bed, growing layered object|progressive construction|cut|the extruder moves along the bed and lays a line ; layers stack up ; the finished object stays on the bed
CNC Milling Toolpath|a milling head cutting a metal block|removes material to a design|spindle head, cutter, metal block, toolpath line, chips|robotic articulation|cut|the cutter follows the toolpath ; chips fly as the block is shaped ; the finished part is revealed
Injection Molding Cycle|a mold closing and filling|makes plastic parts quickly|two mold halves, hopper, screw barrel, plastic melt, ejected part|mechanical component assembly|cut~|the mold halves close ; the screw pushes melt into the cavity ; the halves open and the part is ejected
Metal Powder Laser Sintering|a laser fusing powder layers|fuses metal powder into a part|powder bed, recoater blade, laser head, scan lines, part being built|laser inspection|cut|the recoater spreads a powder layer ; the laser scans and fuses the shape ; the bed lowers and the cycle repeats
Automated Assembly Line|stations along a conveyor|builds a product in stations|conveyor, stations with arms, product parts, quality scanner, packaging box|mechanical component assembly|lane~|parts arrive at station one ; arms add components at each station ; the scanner passes the product into the box
Digital Twin Calibration|a machine and its digital outline|keeps a model synchronized with a real machine|machine shape, outline twin, sensor links, deviation markers, calibration arrows|automated calibration|hero|sensors link the machine to its outline ; deviation markers show a gap ; the outline adjusts until they match`,
    sci: `
Electron Microscope Beam Column|a column with a beam and a sample|images tiny samples with an electron beam|electron gun, focusing lenses, beam line, sample stage, detector|optical detection|cut|the gun emits a beam ; lenses focus it onto the sample ; the detector builds the image
Mass Spectrometer Ion Path|a path that sorts ions by mass|identifies molecules by sorting ions|ion source, acceleration plates, bending magnet, detector, ion dots of different sizes|scientific measurement|lane|ions leave the source ; the magnet bends light ions more than heavy ions ; the detector records separate peaks
Particle Accelerator Ring|a ring with particle bunches|accelerates particles to high energy|ring tunnel, magnets, particle bunches, collision point, detector arcs|network synchronization|orbit~|bunches circulate and gain speed ; two beams meet at the collision point ; detector arcs react
Spectrophotometer Light Absorption|a light path through a sample|measures how much light a sample absorbs|light source, prism, sample cuvette, detector, absorption curve|optical detection|lane|white light is split by the prism ; one colour passes the sample and dims ; the detector draws the absorption curve
Telescope Mirror Calibration|a segmented mirror aligning|focuses starlight precisely|mirror segments, actuators, starlight rays, focus point, sensor|automated calibration|hero|rays reach the mirror segments and scatter ; actuators nudge the segments ; rays converge into a sharp point
Laboratory Pipetting Automation|a robot handling sample plates|prepares samples without manual work|pipetting arm, sample plate, reagent bottles, tip rack, plate reader|robotic articulation|lane|the arm picks a tip and draws reagent ; it dispenses into plate wells ; the plate moves to the reader`,
    future: `
Fusion Reactor Plasma Confinement|a ring chamber holding plasma|confines hot plasma with magnetic fields|ring chamber, magnet coils, plasma loop, heating beams, energy output|energy transfer|orbit~|coils energize in order ; the plasma loop forms and brightens ; energy flows out to a turbine
Brain-Computer Interface Decoding|a head outline with sensors and a cursor|turns neural signals into commands|head outline, sensor array, signal waves, decoder block, moving cursor|circuit signal propagation|lane|sensors pick up waves ; the decoder converts them to commands ; the cursor follows the command
Space Elevator Climber|a tether with a climber car|lifts payloads without rockets|Earth surface, tether line, climber car, orbital station, counterweight|satellite orbital movement|lane|the climber leaves the ground station ; it ascends the tether steadily ; it reaches the station at the top
Vertical Farm Automation|stacked growing trays with a robot carrier|grows crops indoors with automation|tray towers, LED strips, irrigation lines, robot carrier, plants|robotic articulation|cut~|the robot carries a tray to the light ; irrigation feeds the roots ; plants grow and are harvested
Atmospheric Water Harvester|a device pulling water from the air|collects water vapor from the air|intake fan, sorbent panels, heating element, condenser, water drop collector|energy transfer|cut~|air flows in and the sorbent absorbs vapor ; heat releases the vapor to the condenser ; droplets fall into the collector
Holographic Display Projector|a projector forming a floating image|shows images in the air|projector base, light beams, image plane, viewer outline, sync markers|optical detection|hero|beams spread from the base ; the image plane forms where the beams cross ; the viewer moves and the image stays steady`
  };

  const BP = [];
  Object.keys(RAW).forEach(ck => RAW[ck].trim().split('\n').forEach(line => {
    const [sub, obj, fn, comp, mo, hint, steps] = line.split('|');
    BP.push({id: ck + ':' + sub, ck, sub, obj, fn, comp: comp.split(', '), mo, loop: hint.endsWith('~'), hint: hint.replace('~', ''), steps: steps.split(' ; ')});
  }));

  /* ---------- riwayat v2 + migrasi dari v1 ---------- */
  const K2 = 'motionstudio.concepts.v2', K1 = 'motionstudio.concepts.v1';
  const empty = () => ({v: 2, concepts: [], legacy: []});
  function load() {
    try {
      const raw = localStorage.getItem(K2);
      if (raw) { const h = JSON.parse(raw); return Object.assign(empty(), h); }
      const old = localStorage.getItem(K1), h = empty();
      if (old) {
        try { if (!localStorage.getItem(K1 + '.backup')) localStorage.setItem(K1 + '.backup', old); } catch (e) {}
        try { const o = JSON.parse(old); h.legacy = (o.concepts || []).map(c => ({id: c.id, title: c.title, ts: c.ts})); } catch (e) {}
        localStorage.setItem(K2, JSON.stringify(h));
      }
      return h;
    } catch (e) { return empty(); }
  }
  const save = h => { try { localStorage.setItem(K2, JSON.stringify(h)); return true; } catch (e) { return false; } };

  /* ---------- kemiripan ---------- */
  const tok = s => new Set((s || '').toLowerCase().match(/[a-z]{4,}/g) || []);
  const jac = (a, b) => { if (!a.size || !b.size) return 0; let i = 0; a.forEach(x => b.has(x) && i++); return i / (a.size + b.size - i); };
  const T = s => tok(s);
  function sim(c, o) {
    const jo = jac(T(c.ot), T(o.ot)), js = jac(T(c.sq), T(o.sq));
    const s = 0.40 * jo + 0.25 * js + 0.15 * (c.motion === o.motion ? 1 : 0) + 0.10 * (c.hint === o.hint ? 1 : 0) + 0.10 * (c.ck === o.ck ? 1 : 0);
    return {s, jo, js};
  }
  function conflicts(c, pool) {
    for (const o of pool) {
      if (o.bp === c.bp) return 'sama';
      const m = sim(c, o);
      if (m.jo >= 0.55 || m.js >= 0.6 || m.s >= 0.5) return 'mirip';
    }
    return null;
  }

  /* ---------- membuat konsep ---------- */
  function make(bp, styleKey) {
    const cat = CATS.find(c => c[0] === bp.ck), sk = styleKey || pick(Object.keys(STYLES)), S = STYLES[sk];
    const palName = pick(S.pals), hex = PALETS[palName], layout = pick(LAYOUTS[bp.hint]), how = MOTIONS[bp.mo];
    const rng = ['0-3 s', '3-7 s', '7-10 s'], seq = bp.steps.map((s, i) => `${rng[i]}: ${s}`);
    const end = bp.loop ? 'The final state flows back into the opening state for a seamless loop.' : 'The animation resolves into a clean final state and holds; it is a linear process, not a loop.';
    const use = `commercial stock footage for explainer videos, news segments, presentations and web pages about ${cat[2]}`;
    const desc = [`${bp.sub} is a 2D vector animation of ${bp.obj} that ${bp.fn}.`, `Key visual components: ${bp.comp.join(', ')}.`, `Motion behaviour, ${bp.mo}: ${how}.`,
      `Layout: ${layout}.`, `Sequence: ${seq.join(' ')} ${end}`, `Style: ${sk}, ${S.look}; palette "${palName}" (${hex.join(', ')}).`, `Intended use: ${use}.`,
      'Drawn only with flat 2D shapes and paths in Canvas 2D at 1920x1080 (16:9) for 10 seconds, with no 3D rendering, text, logos or external assets.'].join(' ');
    return {bp: bp.id, ck: bp.ck, cat: cat[1], sub: bp.sub, title: bp.sub, object: bp.obj, fn: bp.fn, components: bp.comp, motion: bp.mo, how, hint: bp.hint, layout,
      steps: seq, loop: bp.loop, style: sk, styleLook: S.look, pal: palName, hex, use, desc,
      ot: [bp.obj, bp.fn, bp.comp.join(' ')].join(' '), sq: bp.steps.join(' ')};
  }

  function generate(count, ck, styleKey) {
    const h = load(), used = new Set(h.concepts.map(c => c.bp)), all = ck === 'all';
    const order = shuffle(BP.filter(b => (all || b.ck === ck) && !used.has(b.id))), batch = [];
    [[all, true], [false, true], [false, false]].forEach(([dc, dm]) => {
      for (const bp of order) {
        if (batch.length >= count) break;
        if (batch.some(b => b.bp === bp.id)) continue;
        if (dc && batch.some(b => b.ck === bp.ck)) continue;
        if (dm && batch.some(b => b.motion === bp.mo)) continue;
        const c = make(bp, styleKey);
        if (conflicts(c, h.concepts.concat(batch)) || batch.some(b => sim(c, b).s >= 0.5)) continue;
        batch.push(c);
      }
    });
    const stamp = Date.now();
    batch.forEach((c, i) => {
      c.id = stamp + '-' + i;
      h.concepts.push({id: c.id, bp: c.bp, ck: c.ck, title: c.title, motion: c.motion, hint: c.hint, style: c.style, pal: c.pal, ot: c.ot, sq: c.sq, ts: stamp, used: false});
    });
    const stored = save(h);
    return {batch, exhausted: batch.length < count, stored, total: h.concepts.length, left: BP.filter(b => (all || b.ck === ck) && !h.concepts.some(c => c.bp === b.id)).length};
  }

  const remaining = ck => { const u = new Set(load().concepts.map(c => c.bp)); return BP.filter(b => (ck === 'all' || b.ck === ck) && !u.has(b.id)).length; };
  const stats = () => { const h = load(); return {total: h.concepts.length, used: h.concepts.filter(c => c.used).length, legacy: h.legacy.length}; };
  const markUsed = id => { const h = load(), c = h.concepts.find(x => x.id === id); if (c) { c.used = true; save(h); } };
  const clear = () => { try { localStorage.removeItem(K2); } catch (e) {} };
  const exportJSON = () => JSON.stringify(load(), null, 1);
  function importJSON(text) {
    const d = JSON.parse(text);
    if (!d || !Array.isArray(d.concepts)) throw new Error('Format riwayat tidak dikenali.');
    const h = load(); let added = 0, legacy = 0;
    d.concepts.forEach(c => {
      if (!c || !c.title) return;
      if (c.bp && BP.some(b => b.id === c.bp)) { if (!h.concepts.some(x => x.bp === c.bp)) { h.concepts.push(c); added++; } }
      else if (!h.legacy.some(x => x.title === c.title)) { h.legacy.push({id: c.id, title: c.title, ts: c.ts}); legacy++; }
    });
    (d.legacy || []).forEach(c => { if (c && c.title && !h.legacy.some(x => x.title === c.title)) { h.legacy.push(c); legacy++; } });
    save(h); return {added, legacy};
  }
  return {CATS, BP, MOTIONS, LAYOUTS, generate, remaining, stats, markUsed, clear, exportJSON, importJSON, sim, load, make};
})();

/* ---------- UI ---------- */
(() => {
  const el = id => document.getElementById(id);
  let last = [];
  const flash = (m, e) => setStatus(m, e);
  el('cg-group').innerHTML = '<option value="all">Semua Kategori</option>' + CE.CATS.map(c => `<option value="${c[0]}">${c[1].replace(/&/g, '&amp;')}</option>`).join('');
  el('cg-style').innerHTML = '<option value="">Acak (sesuai konsep)</option>' + Object.keys(STYLES).map(s => `<option>${s}</option>`).join('');
  function refresh() {
    const s = CE.stats(), r = CE.remaining(el('cg-group').value);
    el('cg-hist').textContent = `Riwayat: ${s.total} konsep (${s.used} dipakai). Blueprint tersisa di pilihan ini: ${r}.` + (s.legacy ? ` Arsip konsep lama: ${s.legacy} (tidak dipakai untuk pemeriksaan).` : '');
  }
  const full = c => `${c.title}\n${c.desc}`;
  function copy(text, btn) {
    const done = () => { const t = btn.textContent; btn.textContent = 'Tersalin ✓'; setTimeout(() => btn.textContent = t, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => flash('Salin gagal. Tekan lama teks lalu pilih Salin.', true)); else flash('Browser tidak mendukung salin otomatis.', true);
  }
  const mk = (tag, txt, cls, css) => { const e = document.createElement(tag); if (txt) e.textContent = txt; if (cls) e.className = cls; if (css) e.style.cssText = css; return e; };
  function card(c) {
    const d = mk('div', '', 'cc'); d.appendChild(mk('h3', c.title));
    const tg = mk('div', '', 'tags');
    [c.cat, c.style, c.motion, c.layout].forEach(t => tg.appendChild(mk('span', t, 'tag')));
    c.hex.forEach(x => { const s = mk('span', '', 'sw'); s.style.background = x; s.title = x; tg.appendChild(s); });
    d.appendChild(tg);
    d.appendChild(mk('p', `Objek: ${c.object}. Fungsi: ${c.fn}.`));
    d.appendChild(mk('p', `Komponen: ${c.components.join(', ')}.`, '', 'color:var(--mute)'));
    d.appendChild(mk('p', c.steps.join('  '), '', 'color:var(--mute)'));
    d.appendChild(mk('p', c.desc, '', 'font-size:12px'));
    d.appendChild(mk('p', 'QC: blueprint belum pernah dipakai · tidak mirip riwayat · gerak sesuai fungsi teknologi · 2D vector murni di Canvas · tanpa 3D, teks, dan merek.', '', 'font-size:11px;color:var(--mute)'));
    const r = mk('div', '', '', 'display:flex;gap:8px;flex-wrap:wrap');
    const b1 = mk('button', 'Salin deskripsi'); b1.type = 'button'; b1.onclick = () => copy(full(c), b1);
    const b2 = mk('button', 'Pakai konsep ini', 'pri'); b2.type = 'button'; b2.onclick = () => use(c);
    r.appendChild(b1); r.appendChild(b2); d.appendChild(r); return d;
  }
  function use(c) {
    window.__concept = c; CE.markUsed(c.id);
    el('ptype').value = 'konsep'; el('ratio').value = '16:9'; el('res').value = '1080'; el('secs').value = '10'; el('palet').value = 'gaya'; el('bgmode').value = 'gaya';
    el('subject').value = c.title; bgUi(); refreshPrompt(); refresh();
    flash(`Konsep "${c.title}" dipakai. Salin prompt di bagian 1, tempel ke AI, lalu tempel kodenya di bagian 2.`);
    el('prompt').scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  el('cg-go').onclick = () => {
    const n = Math.max(1, Math.min(10, +el('cg-count').value || 5)), r = CE.generate(n, el('cg-group').value, el('cg-style').value);
    last = r.batch; const out = el('cg-out'); out.innerHTML = ''; r.batch.forEach(c => out.appendChild(card(c)));
    el('cg-bar').style.display = r.batch.length ? 'flex' : 'none';
    let msg = r.batch.length ? `${r.batch.length} konsep dibuat.` : 'Tidak ada konsep baru yang lolos pemeriksaan.';
    if (r.exhausted) msg += ' Blueprint yang belum dipakai dan tidak mirip riwayat sudah habis di pilihan ini. Pilih kategori lain, atau Hapus riwayat konsep jika ingin memakai ulang.';
    if (!r.stored) msg += ' Riwayat tidak bisa disimpan di browser ini. Gunakan Ekspor riwayat.';
    flash(msg, !r.batch.length); refresh();
  };
  el('cg-group').onchange = refresh;
  el('cg-copyall').onclick = () => copy(last.map((c, i) => `${i + 1}. ${full(c)}`).join('\n\n'), el('cg-copyall'));
  el('cg-exp').onclick = () => download(new Blob([CE.exportJSON()], {type: 'application/json'}), 'riwayat-konsep-teknologi.json');
  el('cg-imp').onclick = () => el('cg-file').click();
  el('cg-file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { const r = CE.importJSON(t); flash(`Impor selesai: ${r.added} konsep baru` + (r.legacy ? `, ${r.legacy} konsep lama masuk arsip.` : '.')); refresh(); }).catch(err => flash('Impor gagal: ' + err.message, true));
    e.target.value = '';
  };
  el('cg-clr').onclick = () => { if (confirm('Hapus seluruh riwayat konsep? Konsep lama bisa ditawarkan lagi.')) { CE.clear(); el('cg-out').innerHTML = ''; el('cg-bar').style.display = 'none'; refresh(); flash('Riwayat konsep dihapus. Cadangan riwayat lama (v1) tetap ada di browser.'); } };
  refresh();
})();
