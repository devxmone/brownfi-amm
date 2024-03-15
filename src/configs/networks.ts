import { eth } from "assets";
import {
	StarknetChainId,
	Token,
	Percent,
	JSBI,
} from "l0k_swap-sdk";
import { sample } from "lodash";
import { RpcProvider } from "starknet";

export const APP_CHAIN_ID =
	StarknetChainId.TESTNET;
// process.env.NODE_ENV === "production"
// 	? StarknetChainId.MAINNET
// 	: StarknetChainId.TESTNET;

export const NETWORKS_SUPPORTED = {
	[StarknetChainId.MAINNET]: {
		name: "Starknet Mainnet",
		rpc: [
			"https://starknet-mainnet.public.blastapi.io",
		],
	},
	[StarknetChainId.TESTNET]: {
		name: "Starknet Goerli",
		rpc: [
			"https://starknet-testnet.public.blastapi.io",
		],
	},
};

export const WETH = {
	[StarknetChainId.MAINNET]: new Token(
		StarknetChainId.MAINNET,
		"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
		18,
		"ETH",
		"Ether"
	),
	[StarknetChainId.TESTNET]: new Token(
		StarknetChainId.TESTNET,
		"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
		18,
		"ETH",
		"Ether"
	),
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST = {
	[StarknetChainId.MAINNET]: [
		WETH[StarknetChainId.MAINNET],
	],
	[StarknetChainId.TESTNET]: [
		WETH[StarknetChainId.TESTNET],
	],
};

export const CUSTOM_BASES: {
	[key in StarknetChainId]: {
		[key: string]: Token[];
	};
} = {
	[StarknetChainId.MAINNET]: {},
	[StarknetChainId.TESTNET]: {},
};

export const TOKEN_LIST = {
	[StarknetChainId.MAINNET]: [
		WETH[StarknetChainId.MAINNET],
	],
	[StarknetChainId.TESTNET]: [
		WETH[StarknetChainId.TESTNET],
		new Token(
			StarknetChainId.TESTNET,
			"0x244e5b3b1c0fd2bf5f1e6fd433c9ec05273c09fa68cf75df89571df57ef42e8",
			18,
			"BrownFi",
			"BRFI"
		),
	],
};

export const TOKEN_ICON_LIST = {
	[StarknetChainId.MAINNET]: {
		[WETH[StarknetChainId.MAINNET].address]: eth,
	},
	[StarknetChainId.TESTNET]: {
		[WETH[StarknetChainId.TESTNET].address]: eth,
	},
};

export const UNKNOWN_TOKEN_ICON =
	"https://icones.pro/wp-content/uploads/2021/05/icone-point-d-interrogation-question-noir.png";

export const FACTORY_ADDRESS = {
	[StarknetChainId.MAINNET]: "",
	[StarknetChainId.TESTNET]:
		"0xf6860d0e0493131b5d2b0b4142de9b73520ce24858a37cf75f8be7f15f1318",
};

export const ROUTER_ADDRESS = {
	[StarknetChainId.MAINNET]: "",
	[StarknetChainId.TESTNET]:
		"0x78ebc52c590fc8ab0d4fac9def6ff08b90eef2727ede260b1aad72d0b1f825d",
};

export enum Field {
	INPUT = "INPUT",
	OUTPUT = "OUTPUT",
}

export const MAX_TRADE_HOPS = 3;

export const BETTER_TRADE_LESS_HOPS_THRESHOLD =
	new Percent(
		JSBI.BigInt(50),
		JSBI.BigInt(10000)
	);

export const ZERO_PERCENT = new Percent("0");
export const ONE_HUNDRED_PERCENT = new Percent(
	"1"
);
export const FIVE_PERCENT = new Percent(
	JSBI.BigInt(5),
	JSBI.BigInt(100)
);
export const SWAP_FEE_PERCENT = new Percent(
	JSBI.BigInt(97),
	JSBI.BigInt(100)
);

export const BIPS_BASE = JSBI.BigInt(10000);

export const SN_RPC_PROVIDER = () =>
	new RpcProvider({
		nodeUrl: sample(
			NETWORKS_SUPPORTED[APP_CHAIN_ID].rpc
		)!,
	});

export const getTokenIcon = (
	address: string | undefined
) => {
	return address
		? TOKEN_ICON_LIST[APP_CHAIN_ID][address] ??
				UNKNOWN_TOKEN_ICON
		: UNKNOWN_TOKEN_ICON;
};
