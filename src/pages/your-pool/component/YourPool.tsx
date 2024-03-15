import {
	Link,
	useParams,
} from "react-router-dom";
import { ArrowBack } from "../../liquidity/components/icons";
import { mockPools } from "../../pool/components/Pools";
import {
	Divider,
	Input,
	Slider,
	Typography,
} from "antd";
import { twMerge } from "tailwind-merge";
import { ActiveIcon } from "../../pool/components/icons";
import { FilterIcon } from "./icons";
import { useCallback, useEffect, useRef, useState } from "react";
import SettingParameter from "../../../components/settings-parameter/SettingParameter";
import { ArrowDown } from "pages/swap/components/SwapPage";
import ConfirmAddLP from "components/confirm-addliquidity-modal/ConfirmAddLPModal";
import ConfirmRemoveModal from "components/confirm-remove-modal/ConfirmRemoveModal";
import useSWR from "swr";
import { Token, TokenAmount } from "l0k_swap-sdk";
import {
	PoolState,
	approveTokenLqCallback,
	getAllPairLength,
	getPoolInfo,
	removeLiquidityCallback,
} from "state/liquidity";
import { useAccount } from "@starknet-react/core";
import {
	APP_CHAIN_ID,
	Field,
	ROUTER_ADDRESS,
	SN_RPC_PROVIDER,
	TOKEN_LIST,
	getTokenIcon,
} from "configs/networks";
import { Contract, num } from "starknet";
import BigNumber from "bignumber.js";
import { useGetBalance } from "hooks";
import PairAbi from "../../../abis/Pair.json";
import { useWeb3Store } from "stores/web3";

export const PROCESS_REMOVE = {
	LOADING : 'LOADING',
	SUCCESS : 'SUCCESS',
	FAIL : 'FAIL',
}

const YourPool = () => {
	const { pairAddress } = useParams();
	const provider = SN_RPC_PROVIDER();
	const { account, address } = useAccount();
	const web3State = useWeb3Store();
	const txHash = useWeb3Store();
	const [tokens, setTokens] = useState<{
		[key in Field]: Token | undefined;
	}>({
		[Field.INPUT]: TOKEN_LIST[APP_CHAIN_ID][0],
		[Field.OUTPUT]: TOKEN_LIST[APP_CHAIN_ID][1],
	});

	const [processRemove, setProcessRemove] = useState<string>(PROCESS_REMOVE.LOADING);


	const { data } = useSWR<{
		balances: (TokenAmount | undefined)[];
		poolInfo: PoolState | undefined;
		allPairLength: number | undefined;
	}>(
		[
			address,
			tokens[Field.INPUT],
			tokens[Field.OUTPUT],
		],
		async () => {
			// if (!address || !isConnected)
			// 	return {
			// 		balances: [],
			// 		poolInfo: undefined,
			// 	};
			const provider = SN_RPC_PROVIDER();
			const balances = await Promise.all(
				[
					tokens[Field.INPUT],
					tokens[Field.OUTPUT],
				].map(async (t) => {
					if (!address || !t) return undefined;
					const res = await provider.callContract(
						{
							contractAddress: t.address,
							entrypoint: "balanceOf",
							calldata: [address],
						}
					);
					return new TokenAmount(
						t,
						num.hexToDecimalString(res.result[0])
					);
				})
			);

			const poolInfo = await getPoolInfo(
				address,
				provider,
				[
					tokens[Field.INPUT],
					tokens[Field.OUTPUT],
				]
			);

			const allPairLength =
				await getAllPairLength(provider);

			return {
				balances,
				poolInfo,
				allPairLength,
			};
		}
	);

	console.log(data);

	const data1 = mockPools()[0];

	const inputToken0Ref = useRef(null);

	const [tab, setTab] = useState<Tab>("view");
	const [isShowSetting, setIsShowSetting] =
		useState<boolean>(false);
	const [isShowConfirm, setIsShowConfirm] =
		useState<boolean>(false);

	const [disabled, setDisabled] = useState(false);
	const [k, setK] = useState<number>(
		data1.parameter
	);
	const [percent, setPercent] =
		useState<number>(0);

	const onChangeK = (newValue: number) => {
		setK(newValue);
	};

	const [
		isShowReviewModal,
		setIsShowReviewModal,
	] = useState<boolean>(false);

	// Token 0 Input Amount
	const [
		token0InputAmount,
		setToken0InputAmount,
	] = useState(0);
	// Token 1 Output Amount
	const [
		token1OutputAmount,
		setToken1OutputAmount,
	] = useState<any>(0);
	const [
		userToken0BalanceAmount,
		setUserToken0BalanceAmount,
	] = useState(1);
	const [
		userToken1BalanceAmount,
		setUserToken1BalanceAmount,
	] = useState(2000);
	// Token 1 Output Display Amount
	const [
		token1OutputDisplayAmount,
		setToken1OutputDisplayAmount,
	] = useState(0);

	const handleToken0InputAmountChange = (
		event: any
	) => {
		if (event.target.value === "") {
			setToken0InputAmount(0);
			setToken1OutputAmount(0);
			setToken1OutputDisplayAmount(0);
		} else {
			setToken0InputAmount(event.target.value);
		}
		console.log(token0InputAmount);
	};

	if (!data1) return;

	const [allowanceLq, setAllowanceLq] = useState<BigNumber>();

	useEffect(()=>{
		const getAllowance = async()=>{
			if(data?.poolInfo?.pairAddress && address){
				const tokenContract = new Contract(
				PairAbi,
				data?.poolInfo?.pairAddress || '',
				account
			);
			const res = await tokenContract.call("allowance", [
				address,
				ROUTER_ADDRESS[APP_CHAIN_ID],
			]);
				setAllowanceLq(new BigNumber(res.toString()))
			}
			
		}
		getAllowance()
	},[address ,data?.poolInfo?.pairAddress, txHash ])

	
	const [approveTx, setApproveTx] = useState<
		string | undefined
	>(undefined);

	const [isApprove, setIsApprove] =
	useState<boolean>(false);

	const [checkApprove, setCheckApprove] =
	useState<boolean>(false);

	const lqBalanceRemove = useGetBalance(provider,address, data?.poolInfo?.pairAddress)

	const onChangePercent = (newValue: number) => {
		setPercent(newValue);
		const lpBalance = new BigNumber(lqBalanceRemove).multipliedBy(newValue).dividedBy(100)
		if(allowanceLq && new BigNumber(lpBalance).isLessThan(allowanceLq)){
			setCheckApprove(true)
		}
		else {
			setCheckApprove(false)
		}
	};



	const reserve0Persent = new BigNumber(data?.poolInfo?.pair?.reserve0?.raw.toString() || 0).multipliedBy(percent).dividedBy(new BigNumber(10).pow(18).multipliedBy(100))

	const reserve1Persent = new BigNumber(data?.poolInfo?.pair?.reserve1?.raw.toString() || 0).multipliedBy(percent).dividedBy(new BigNumber(10).pow(18).multipliedBy(100))

	const lpBalance = new BigNumber(lqBalanceRemove).multipliedBy(percent).dividedBy(100).decimalPlaces(0)     

	const onApproveTokenCallback =
		useCallback(async () => {
			try {
				setIsApprove(true);
				const tx = await approveTokenLqCallback(
					address,
					account,
					data?.poolInfo?.pairAddress || '',
					lpBalance?.toString()
				);
				setApproveTx(tx);
				setIsApprove(false);
				setCheckApprove(true);
			} catch (error) {
				console.error(error);
				setIsApprove(false);
			}
		}, [
			address,
			account,
			data,
			lqBalanceRemove
		]);

	const removeLiquidity =
	useCallback(async () => {
		try {
			setIsShowConfirm(true);
			setProcessRemove(PROCESS_REMOVE.LOADING)
			const tx = await removeLiquidityCallback(
				address,
				account,
				tokens,
				lpBalance?.toString()
			);
			setProcessRemove(PROCESS_REMOVE.SUCCESS)
			useWeb3Store.setState({
				...web3State,
				txHash: tx.transaction_hash,
			});
		} catch (error) {
			console.error(error);
			setProcessRemove(PROCESS_REMOVE.FAIL)
		}
	}, [
		address,
		account,
		tokens,
		reserve1Persent,
	]);

	return (
		<div className="flex flex-col items-start">
			<div className="flex w-[500px] flex-col items-end justify-center bg-[#1D1C21] gap-8 p-8">
				<div className="flex flex-col items-start gap-6 self-stretch">
					<div className="flex flex-col items-start gap-[10px] self-stretch">
						{tab === "view" ? (
							<Link
								to="/pools"
								className="flex items-center gap-3 self-stretch hover:text-white"
							>
								<ArrowBack />
								<span className="text-2xl !font-['Russo_One'] leading-[29px]">
									{tab === "view" &&
										"Back to Pools"}
								</span>
							</Link>
						) : (
							<div
								onClick={() => setTab("view")}
								className="flex items-center gap-3 self-stretch hover:text-white cursor-pointer"
							>
								<ArrowBack />
								<span className="text-2xl !font-['Russo_One'] leading-[29px]">
									{tab === "add" &&
										"Add More Liquidity"}
									{tab === "remove" &&
										"Remove Liquidity"}
								</span>
							</div>
						)}
					</div>
					<div
						className={twMerge(
							"flex flex-col items-start gap-6 self-stretch",
							tab === "remove" && "hidden"
						)}
					>
						<div className="flex flex-col items-start gap-4 self-stretch">
							<div className="flex justify-between items-center self-stretch">
								<div className="flex items-center gap-2">
									<div className="flex items-start">
										<img
											src={getTokenIcon(
												data?.poolInfo?.pair
													?.token0.address
											)}
											alt=""
											className="w-5 h-5"
										/>
										<img
											src={getTokenIcon(
												data?.poolInfo?.pair
													?.token1.address
											)}
											alt=""
											className="ml-[-8px] w-5 h-5"
										/>
									</div>
									<Typography className="text-base font-medium">
										{
											data?.poolInfo?.pair?.token0
												.name
										}
										/
										{
											data?.poolInfo?.pair?.token1
												.name
										}
									</Typography>
									<div
										className={twMerge(
											"flex py-[2px] px-3 items-center gap-1 w-[74px]",
											data1.status === "Active" &&
												"bg-[rgba(39,227,159,0.10)]",
											data1.status === "Close" &&
												"bg-[rgba(255,59,106,0.10)]"
										)}
									>
										{data1.status === "Active" ? (
											<ActiveIcon color="#27E39F" />
										) : (
											<ActiveIcon color="#FF3B6A" />
										)}
										<Typography
											className={twMerge(
												"text-xs font-medium leading-[18px]",
												data1.status ===
													"Active" && "#27E39F",
												data1.status ===
													"Close" && "#FF3B6A"
											)}
										>
											{data1.status}
										</Typography>
									</div>
								</div>
								<div
									className={twMerge(
										"flex h-6 px-4 justify-center items-center gap-[10px] bg-[#773030] cursor-pointer",
										data1.status === "Close" &&
											"hidden"
									)}
									onClick={() => setTab("remove")}
								>
									<Typography className="text-xs font-bold leading-[15px]">
										Remove
									</Typography>
								</div>
							</div>
							<div className="flex items-start gap-3 text-sm font-medium">
								<div className="flex flex-col items-start gap-[6px]">
									<Typography>
										Parameter:
									</Typography>
									<Typography>
										Current LP price:
									</Typography>
								</div>
								<div className="flex items-start gap-2">
									<div className="flex flex-col items-start gap-[6px]">
										<div className="flex flex-col px-2 items-start gap-[10px] bg-[#131216]">
											<Typography>
												{data1.parameter}
											</Typography>
										</div>
										<Typography>
											{data1.currentPrice}
										</Typography>
									</div>
									<FilterIcon
										onClick={() =>
											setIsShowSetting(true)
										}
									/>
								</div>
							</div>
						</div>
						<div
							className={twMerge(
								"flex flex-col items-start gap-2 self-stretch",
								tab !== "view" && "hidden"
							)}
						>
							<div className="flex flex-col py-4 px-5 items-start gap-3 self-stretch bg-[#323038]">
								<div className="flex w-full justify-between items-center self-stretch">
									<Typography className="text-base font-medium">
										Liquidity
									</Typography>
									<div
										className="flex h-6 px-4 justify-center items-center gap-1 bg-[#1E1E1E] cursor-pointer"
										onClick={() => setTab("add")}
									>
										<Typography className="text-xs font-bold leading-[15px]">
											Increase liquidity
										</Typography>
									</div>
								</div>
								<Typography className="text-[32px] font-semibold">
									{data1.status === "Close"
										? "--"
										: "--"}
								</Typography>
								<div className="flex flex-col items-start gap-1 self-stretch text-sm font-medium">
									<div className="flex justify-between items-center self-stretch">
										<div className="flex items-center gap-3">
											<img
												src={getTokenIcon(
													data?.poolInfo?.pair
														?.token0.address
												)}
												alt=""
												className="w-5 h-5"
											/>
											<Typography>
												{
													data?.poolInfo?.pair
														?.token0.name
												}
											</Typography>
										</div>
										<div className="flex items-center gap-6">
											{data1.status ===
											"Close" ? (
												<Typography>0</Typography>
											) : (
												<>
													<Typography>
														{Number(
															data?.poolInfo?.pair?.reserve0.raw.toString()
														) /
															10 ** 18}
													</Typography>
													<Typography>
														--
													</Typography>
												</>
											)}
										</div>
									</div>
								</div>
								<div className="flex flex-col items-start gap-1 self-stretch text-sm font-medium">
									<div className="flex justify-between items-center self-stretch">
										<div className="flex items-center gap-3">
											<img
												src={getTokenIcon(
													data?.poolInfo?.pair
														?.token1.address
												)}
												alt=""
												className="w-5 h-5"
											/>
											<Typography>
												{
													data?.poolInfo?.pair
														?.token1.name
												}
											</Typography>
										</div>
										<div className="flex items-center gap-6">
											{data1.status ===
											"Close" ? (
												<Typography>0</Typography>
											) : (
												<>
													<Typography>
														{Number(
															data?.poolInfo?.pair?.reserve1.raw.toString()
														) /
															10 ** 18}
													</Typography>
													<Typography>
														--
													</Typography>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col py-4 px-5 items-start gap-3 self-stretch bg-[#323038]">
								<div className="flex items-center gap-3">
									<Typography className="text-base font-medium">
										Accrued fee
									</Typography>
									<div className="flex items-center py-[2px] px-[12px] bg-[#314243] shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)]">
										<Typography className="text-sm font-medium text-[#27E39F] leading-[20px]">
											{data1.accruedFee}%
										</Typography>
									</div>
								</div>
								<Typography className="text-[32px] font-semibold">
									{data1.status === "Close"
										? "--"
										: "$0.000675"}
								</Typography>
								<div className="flex justify-between items-center self-stretch text-sm font-medium">
									<div className="flex items-center gap-3">
										<img
											src={data1.token0.icon}
											alt=""
											className="w-5 h-5"
										/>
										<Typography>
											{data1.token0.name}
										</Typography>
									</div>
									<Typography>
										{data1.status === "Close"
											? "0"
											: "< 0.001"}
									</Typography>
								</div>
								<div className="flex justify-between items-center self-stretch text-sm font-medium">
									<div className="flex items-center gap-3">
										<img
											src={data1.token1.icon}
											alt=""
											className="w-5 h-5"
										/>
										<Typography>
											{data1.token1.name}
										</Typography>
									</div>
									<Typography>
										{data1.status === "Close"
											? "0"
											: "< 0.001"}
									</Typography>
								</div>
							</div>
						</div>
						<div
							className={twMerge(
								"flex flex-col items-start gap-6 self-stretch",
								tab !== "add" && "hidden"
							)}
						>
							<div className="flex flex-col py-4 px-5 items-start gap-3 self-stretch bg-[#323038]">
								<div className="flex justify-between items-center self-stretch">
									<div className="flex items-center gap-3">
										<img
											src={data1.token0.icon}
											alt=""
											className="w-5 h-5"
										/>
										<Typography>
											{data1.token0.name}
										</Typography>
									</div>
									<div className="flex items-center gap-6">
										<Typography>0.1</Typography>
									</div>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<div className="flex items-center gap-3">
										<img
											src={data1.token1.icon}
											alt=""
											className="w-5 h-5"
										/>
										<Typography>
											{data1.token1.name}
										</Typography>
									</div>
									<div className="flex items-center gap-6">
										<Typography>0.5</Typography>
									</div>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<Typography>
										Parameter
									</Typography>
									<Typography>
										{data1.parameter}
									</Typography>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<Typography>
										LP price
									</Typography>
									<Typography>
										{data1.currentPrice}
									</Typography>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<Typography>Fee</Typography>
									<Typography>
										{data1.accruedFee}
									</Typography>
								</div>
							</div>
							<div className="flex flex-col items-start gap-2 self-stretch">
								<div className="flex flex-col items-start gap-5 self-stretch bg-[#131216] p-4">
									<div className="flex justify-between items-center self-stretch">
										<span className="text-lg font-normal text-white font-['Russo_One'] leading-[22px]">
											You Pay
										</span>
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-1">
												<Typography className="text-base font-normal leading-[24px]">
													Balance:
												</Typography>
												<Typography className="text-base font-normal leading-[24px]">
													{
														userToken0BalanceAmount
													}
												</Typography>
											</div>
											<div className="flex h-6 justify-center items-center gap-[10px] bg-[#773030] px-4 cursor-pointer">
												<Typography className="text-xs font-bold leading-[15px]">
													Max
												</Typography>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-start gap-[2px] self-stretch">
										<div className="flex justify-between items-center self-stretch">
											<div className="flex justify-between items-center self-stretch">
												<Input
													placeholder="0.0"
													className="border-none px-0 text-xl font-bold max-w-[100px] text-[#C6C6C6]"
													ref={inputToken0Ref}
													onChange={
														handleToken0InputAmountChange
													}
												/>
											</div>
											<div className="flex justify-between items-center bg-[#1D1C21] py-[7px] px-3 cursor-pointer shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] w-[153px]">
												<div className="flex items-center gap-2">
													<img
														src={
															data1.token0.icon
														}
														alt=""
														className="h-5 w-5"
													/>
													<Typography className="text-sm font-medium">
														{data1.token0.name}
													</Typography>
												</div>
												<ArrowDown />
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-col items-start gap-5 self-stretch bg-[#131216] p-4">
									<div className="flex justify-between items-center self-stretch">
										<span className="text-lg font-normal text-white font-['Russo_One']">
											Your Receive
										</span>
										<div className="flex items-center gap-1">
											<Typography className="text-base font-normal">
												Balance:
											</Typography>
											<Typography className="text-base font-normal">
												{userToken1BalanceAmount}
											</Typography>
										</div>
									</div>
									<div className="flex flex-col items-start gap-[2px] self-stretch">
										<div className="flex justify-between items-center self-stretch">
											<div className="flex justify-between items-center self-stretch">
												<Input
													placeholder="0.0"
													className="border-none px-0 text-xl max-w-[100px] font-medium text-[#27E3AB]"
													value={
														token1OutputAmount
													}
												/>
											</div>
											<div className="flex justify-between items-center bg-[#1D1C21] py-[7px] px-3 cursor-pointer shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] w-[153px]">
												<div className="flex items-center gap-2">
													<img
														src={
															data1.token1.icon
														}
														alt=""
														className="h-5 w-5"
													/>
													<Typography className="text-sm font-medium">
														{data1.token1.name}
													</Typography>
												</div>
												<ArrowDown />
											</div>
										</div>
									</div>
								</div>
							</div>
							{token0InputAmount >
							userToken0BalanceAmount ? (
								<div className="flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#737373] cursor-pointer">
									<Typography className="text-base font-bold">
										Insufficient Balance
									</Typography>
								</div>
							) : token0InputAmount === 0 ? (
								<div className="flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#737373] cursor-pointer">
									<Typography className="text-base font-bold">
										Enter An Amount
									</Typography>
								</div>
							) : (
								<div
									className="flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#773030] cursor-pointer"
									onClick={() =>
										setIsShowReviewModal(true)
									}
								>
									<Typography className="text-base font-bold">
										Approve {data1.token0.name}
									</Typography>
								</div>
							)}
						</div>
					</div>
					<div
						className={twMerge(
							"flex flex-col items-start gap-6 self-stretch",
							tab !== "remove" && "hidden"
						)}
					>
						<div className="flex flex-col items-start gap-4 self-stretch">
							<div className="flex justify-between items-center self-stretch">
								<div className="flex items-center gap-2">
									<div className="flex items-start">
										<img
											src={getTokenIcon(
												data?.poolInfo?.pair
													?.token0.address
											)}
											alt=""
											className="w-5 h-5"
										/>
										<img
											src={getTokenIcon(
												data?.poolInfo?.pair
													?.token1.address
											)}
											alt=""
											className="ml-[-8px] w-5 h-5"
										/>
									</div>
									<Typography className="text-base font-medium">
									{
											data?.poolInfo?.pair?.token0
												.name
										}
										/
										{
											data?.poolInfo?.pair?.token1
												.name
										}
									</Typography>
								</div>
								<div
									className={twMerge(
										"flex py-[2px] px-3 items-center gap-1 w-[74px]",
										data1.status === "Active" &&
											"bg-[rgba(39,227,159,0.10)]",
										data1.status === "Close" &&
											"bg-[rgba(255,59,106,0.10)]"
									)}
								>
									{data1.status === "Active" ? (
										<ActiveIcon color="#27E39F" />
									) : (
										<ActiveIcon color="#FF3B6A" />
									)}
									<Typography
										className={twMerge(
											"text-xs font-medium leading-[18px]",
											data1.status === "Active" &&
												"#27E39F",
											data1.status === "Close" &&
												"#FF3B6A"
										)}
									>
										{data1.status}
									</Typography>
								</div>
							</div>
							<div className="flex flex-col pt-4 pb-8 px-5 items-start gap-4 self-stretch bg-[#323038]">
								<div className="flex w-full justify-between items-center self-stretch">
									<Typography className="text-base font-medium">
										Amount
									</Typography>
									<div
										className="flex h-6 px-4 justify-center items-center gap-1 bg-[#1E1E1E] cursor-pointer"
										onClick={() => setTab("add")}
									>
										<Typography className="text-xs font-bold leading-[15px]">
											Increase liquidity
										</Typography>
									</div>
								</div>
								<div className="flex flex-col items-start gap-8 self-stretch">
									<div className="flex items-center gap-5">
										<Typography className="text-[32px] leading-[39px]">
											{`${percent}%`}
										</Typography>
										{percentArray().map(
											(item, idx) => (
												<div
													key={idx}
													className="flex h-8 px-4 justify-center items-center gap-1 bg-[#27E3AB] cursor-pointer"
													onClick={() =>
														setPercent(item.value)
													}
												>
													<Typography className="text-xs font-bold text-[#1E1E1E]">
														{item.label}
													</Typography>
												</div>
											)
										)}
									</div>
									<Slider
										className="w-full !m-0"
										defaultValue={percent}
										value={percent}
										// tooltip={{ open: true }}
										max={100}
										min={0}
										step={1}
										tooltipPlacement="bottom"
										onChange={onChangePercent}
										disabled={disabled}
									/>
								</div>
							</div>
						</div>
						<div className="flex py-3 px-5 flex-col items-start gap-3 self-stretch bg-[#323038] text-sm font-medium">
							<div className="flex justify-between items-center self-stretch">
								<Typography>
									Pooled {data?.poolInfo?.pair?.token0.name}
								</Typography>
								<div className="flex items-center gap-3">
									<Typography>{reserve0Persent?.toString() || '--'}</Typography>
									<img
										src={getTokenIcon(
											data?.poolInfo?.pair?.token0.address
										)}
										alt=""
										className="w-5 h-5"
									/>
								</div>
							</div>
							<div className="flex justify-between items-center self-stretch">
								<Typography>
									Pooled {data?.poolInfo?.pair?.token1
												.name}
								</Typography>
								<div className="flex items-center gap-3">
									<Typography>{reserve1Persent?.toString() || '--'}</Typography>
									<img
										src={getTokenIcon(
											data?.poolInfo?.pair
												?.token1.address
										)}
										alt=""
										className="w-5 h-5"
									/>
								</div>
							</div>
							<Divider className="!my-0" />
							<div className="flex justify-between items-center self-stretch">
								<Typography>
									{data?.poolInfo?.pair?.token0.name} Fees Earned:
								</Typography>
								<div className="flex items-center gap-3">
									<Typography>-</Typography>
									<img
										src={getTokenIcon(
											data?.poolInfo?.pair
												?.token0.address
										)}
										alt=""
										className="w-5 h-5"
									/>
								</div>
							</div>
							<div className="flex justify-between items-center self-stretch">
								<Typography>
									{data?.poolInfo?.pair?.token1.name} Fees Earned:
								</Typography>
								<div className="flex items-center gap-3">
									<Typography>-</Typography>
									<img
										src={getTokenIcon(
											data?.poolInfo?.pair
												?.token1.address
										)}
										alt=""
										className="w-5 h-5"
									/>
								</div>
							</div>
						</div>
						{!checkApprove ? (
							<div
							className={twMerge(
								"flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#773030] cursor-pointer",
								approveTx && "hidden"
							)}
							onClick={onApproveTokenCallback}
						>
							<Typography className="text-base font-bold">
								{isApprove
									? "Approving..."
									: `Approve`}
							</Typography>
						</div>
						): (
							<div
							className="flex py-[18px] px-6 justify-center items-center gap-2 self-stretch bg-[#773030] cursor-pointer"
							onClick={removeLiquidity}
						>
							<Typography className="text-base font-bold leading-[20px]">
								Remove
							</Typography>
						</div>
						)}
					</div>
				</div>
			</div>
			{isShowSetting && (
				<SettingParameter
					isShowing={isShowSetting}
					hide={setIsShowSetting}
					k={k}
					onChangeK={onChangeK}
					disabled={disabled}
				/>
			)}
			{isShowReviewModal && (
				<ConfirmAddLP
					isShowing={isShowReviewModal}
					hide={setIsShowReviewModal}
					token0={data1.token0}
					token1={data1.token1}
					token0InputAmount={token0InputAmount}
					token1OutputAmount={token1OutputAmount}
				/>
			)}
			{isShowConfirm &&  processRemove && (
				<ConfirmRemoveModal
					isShowing={isShowConfirm}
					processRemove={processRemove}
					hide={setIsShowConfirm}
					token0={data?.poolInfo?.pair?.token0}
					token1={data?.poolInfo?.pair?.token1}
					token0InputAmount={reserve0Persent?.decimalPlaces(6)?.toString()}
					token1OutputAmount={reserve1Persent?.decimalPlaces(6)?.toString()}
				/>
			)}
		</div>
	);
};

type Tab = "view" | "add" | "remove";

type Percent = 25 | 50 | 75 | 100;

interface IPercent {
	label: string;
	value: Percent;
}

const percentArray = (): IPercent[] => [
	{
		label: "25%",
		value: 25,
	},
	{
		label: "50%",
		value: 50,
	},
	{
		label: "75%",
		value: 75,
	},
	{
		label: "Max",
		value: 100,
	},
];

export default YourPool;
