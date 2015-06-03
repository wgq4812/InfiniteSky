// This file is part of InfiniteSky.
// Copyright (c) InfiniteSky Dev Teams - Licensed under GNU GPL
// For more information, see LICENCE in the main folder
vms('Item', [], function(){
	// Shorthand Types
	//var String = db.mongoose.Schema.Types.String;
	//var Number = db.mongoose.Schema.Types.Number;
	var Bool = db.mongoose.Schema.Types.Boolean;
	//var Array = db.mongoose.Schema.Types.Array;
	//var Date = db.mongoose.Schema.Types.Date;
	var ObjectId = db.mongoose.Schema.Types.ObjectId;
	var Mixed = db.mongoose.Schema.Types.Mixed;

	var npcschema = mongoose.Schema({
		_id: { type: Number, unique: true, index: true, default: 0 },
        Name: String, // 4
        Unknown1: Number,
        Unknown2: Number,
        Unknown3: Number,
        Unknown4: Number,
        Unknown5: Number,
        Unknown6: Number,
        Unknown7: Number,
        Unknown8: Number,
        Unknown9: Number,
        Unknown10: Number,
        Unknown11: Number,
        Unknown12: Number,
        Unknown13: Number,
        Unknown14: Number,
        Unknown15: Number,
        Unknown16: Number,
        Unknown17: Number,
        PageCount: Number,
        Chat1: String,
        Chat2: String,
        Chat3: String,
        Chat4: String,
        Chat5: String,
        Unknown18: Number,
        Unknown19: Number,
        Unknown20: Number,
        Unknown21: Number,
        Unknown22: Number,
        Unknown23: Number,
        Unknown24: Number,
        Unknown25: Number,
        Unknown26: Number,
        Unknown27: Number,
        Unknown28: Number,
        Unknown29: Number,
        Unknown30: Number,
        Unknown31: Number,
        Unknown32: Number,
        Unknown33: Number,
        Unknown34: Number,
        Unknown35: Number,
        Unknown36: Number,
        Unknown37: Number,
        Unknown38: Number,
        Unknown39: Number,
        Unknown40: Number,
        Unknown41: Number,
        Unknown42: Number,
        Unknown43: Number,
        Unknown44: Number,
        Unknown45: Number,
        Unknown46: Number,
        Unknown47: Number,
        Unknown48: Number,
        Unknown49: Number,
        Unknown50: Number,
        Unknown51: Number,
        Unknown52: Number,
        Unknown53: Number,
        Unknown54: Number,
        Unknown55: Number,
        Unknown56: Number,
        Unknown57: Number,
        Unknown58: Number,
        Unknown59: Number,
        Unknown60: Number,
        Unknown61: Number,
        Unknown62: Number,
        Unknown63: Number,
        Unknown64: Number,
        Unknown65: Number,
        Unknown66: Number,
        Unknown67: Number,
        Unknown68: Number,
        Unknown69: Number,
        Unknown70: Number,
        Unknown71: Number,
        Unknown72: Number,
        Unknown73: Number,
        Unknown74: Number,
        Unknown75: Number,
        Unknown76: Number,
        Unknown77: Number,
        Unknown78: Number,
        Unknown79: Number,
        Unknown80: Number,
        Unknown81: Number,
        Unknown82: Number,
        Unknown83: Number,
        Unknown84: Number,
        Unknown85: Number,
        Unknown86: Number,
        Unknown87: Number,
        Unknown88: Number,
        Unknown89: Number,
        Unknown90: Number,
        Unknown91: Number,
        Unknown92: Number,
        Unknown93: Number,
        Unknown94: Number,
        Unknown95: Number,
        Unknown96: Number,
        Unknown97: Number,
        Unknown98: Number,
        Unknown99: Number,
        Unknown100: Number,
        Unknown101: Number,
        Unknown102: Number,
        Unknown103: Number,
        Unknown104: Number,
        Unknown105: Number,
        Unknown106: Number,
        Unknown107: Number,
        Unknown108: Number,
        Unknown109: Number,
        Unknown110: Number,
        Unknown111: Number,
        Unknown112: Number,
        Unknown113: Number,
        Unknown114: Number,
        Unknown115: Number,
        Unknown116: Number,
        Unknown117: Number,
        Unknown118: Number,
        Unknown119: Number,
        Unknown120: Number,
        Unknown121: Number,
        Unknown122: Number,
        Unknown123: Number,
        Unknown124: Number,
        Unknown125: Number,
        Unknown126: Number,
        Unknown127: Number,
        Unknown128: Number,
        Unknown129: Number,
        Unknown130: Number,
        Unknown131: Number,
        Unknown132: Number,
        Unknown133: Number,
        Unknown134: Number,
        Unknown135: Number,
        Unknown136: Number,
        Unknown137: Number,
        Unknown138: Number,
        Unknown139: Number,
        Unknown140: Number,
        Unknown141: Number,
        Unknown142: Number,
        Unknown143: Number,
        Unknown144: Number,
        Unknown145: Number,
        Unknown146: Number,
        Unknown147: Number,
        Unknown148: Number,
        Unknown149: Number,
        Unknown150: Number,
        Unknown151: Number,
        Unknown152: Number,
        Unknown153: Number,
        Unknown154: Number,
        Unknown155: Number,
        Unknown156: Number,
        Unknown157: Number,
        Unknown158: Number,
        Unknown159: Number,
        Unknown160: Number,
        Unknown161: Number,
        Unknown162: Number,
        Unknown163: Number,
        Unknown164: Number,
        Unknown165: Number,
        Unknown166: Number,
        Unknown167: Number,
        Unknown168: Number,
        Unknown169: Number,
        Unknown170: Number,
        Unknown171: Number,
        Unknown172: Number,
        Unknown173: Number,
        Unknown174: Number,
        Unknown175: Number,
        Unknown176: Number,
        Unknown177: Number,
        Unknown178: Number,
        Unknown179: Number,
        Unknown180: Number,
        Unknown181: Number,
        Unknown182: Number,
        Unknown183: Number,
        Unknown184: Number,
        Unknown185: Number,
        Unknown186: Number,
        Unknown187: Number,
        Unknown188: Number,
        Unknown189: Number,
        Unknown190: Number,
        Unknown191: Number,
        Unknown192: Number,
        Unknown193: Number,
        Unknown194: Number,
        Unknown195: Number,
        Unknown196: Number,
        Unknown197: Number,
        Unknown198: Number,
        Unknown199: Number,
        Unknown200: Number,
        Unknown201: Number,
        Unknown202: Number,
        Unknown203: Number,
        Unknown204: Number,
        Unknown205: Number,
        Unknown206: Number,
        Unknown207: Number,
        Unknown208: Number,
        Unknown209: Number,
        Unknown210: Number,
        Unknown211: Number,
        Unknown212: Number,
        Unknown213: Number,
        Unknown214: Number,
        Unknown215: Number,
        Unknown216: Number,
        Unknown217: Number,
        Unknown218: Number,
        Unknown219: Number,
        Unknown220: Number,
        Unknown221: Number,
        Unknown222: Number,
        Unknown223: Number,
        Unknown224: Number,
        Unknown225: Number,
        Unknown226: Number,
        Unknown227: Number,
        Unknown228: Number,
        Unknown229: Number,
        Unknown230: Number,
        Unknown231: Number,
        Unknown232: Number,
        Unknown233: Number,
        Unknown234: Number,
        Unknown235: Number,
        Unknown236: Number,
        Unknown237: Number,
        Unknown238: Number,
        Unknown239: Number,
        Unknown240: Number,
        Unknown241: Number,
        Unknown242: Number,
        Unknown243: Number,
        Unknown244: Number,
        Unknown245: Number,
        Unknown246: Number,
        Unknown247: Number,
        Unknown248: Number,
        Unknown249: Number,
        Unknown250: Number,
        Unknown251: Number,
        Unknown252: Number,
        Unknown253: Number,
        Unknown254: Number,
        Unknown255: Number,
        Unknown256: Number,
        Unknown257: Number,
        Unknown258: Number,
        Unknown259: Number,
        Unknown260: Number,
        Unknown261: Number,
        Unknown262: Number,
        Unknown263: Number,
        Unknown264: Number,
        Unknown265: Number,
        Unknown266: Number,
        Unknown267: Number,
        Unknown268: Number,
        Unknown269: Number,
        Unknown270: Number,
        Unknown271: Number,
        Unknown272: Number,
        Unknown273: Number,
        Unknown274: Number,
        Unknown275: Number,
        Unknown276: Number,
        Unknown277: Number,
        HealthMax: Number,
        Entrance: Number,
        Teach: Number,
        Storage: Number,
        MakeGuild: Number,
        Trade: Number,
        Refine: Number,
        Craft: Number,
        Move: Number,
        Bank: Number,
        Enchant: Number,
        Refill: Number,
        Antique: Number,
        ResetStat: Number,
        ExpGuild: Number,
        CombineScrolls: Number,
        JoinBattle: Number,
        Leave: Number,
        Upgrade: Number,
        PlaceBet: Number,
        Move2: Number,
        Buy: Number,
        Extract: Number,
        ListItems: Number,
        Unknown01: Number,
        Withdraw: Number,
        DownGrade: Number,
        CombineItems: Number,
        DiceMatch: Number,
        Leader: Number,
        Gift: Number,
        Reward: Number,
        Exchange: Number,
        Track: Number,
        Isolation: Number,
        Convert: Number,
        Unknown278: Number,
        Unknown279: Number,
        Unknown280: Number,
        CraftWeapon: Number,
        CraftArmor: Number,
        Buff: Number,
        Unknown281: Number,
        ConvertCP: Number,
        Unknown282: Number,
        Unknown283: Number,
        Unknown284: Number,
        CombinePet: Number,
        Unknown285: Number,
        Unknown286: Number,
        ENDOFLIST: Number,
        Unknown287: Number,
        Unk1: Number,
        Items: [Number]
        //int8lu("Unk3", 3)
        //Shift8Bytes",: Number,
        //string("CellFile", 6025), 
	});


    npcschema.toString = function(kind) {
		return this.ID+" - "+this.Name;
	}


	//Constructor
	delete mongoose.models['npc'];
	var NPC = db.mongoose.model('npc', npcschema);

	db.NPC = NPC;

	NPC.getById = function(id, callback){
		db.NPC.findOne({
			_id: id
		}, callback);
	};
});
