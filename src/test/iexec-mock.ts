import IexecProxyBuild from '@iexec/poco/build/contracts/IexecInterfaceToken.json';
import { MockContract, deployMockContract } from 'ethereum-waffle';
import { ContractFactory, ethers } from 'ethers';
import { IExec } from 'iexec';
import {
  ReplaySubject,
  Subscription,
  catchError,
  finalize,
  of,
  tap,
} from 'rxjs';
import { TaskStatus } from '$/types/desmo-types';
import { MockProvider } from '@ethereum-waffle/provider';

import {
  abi as DesmoHubABI,
  bytecode as DesmoHubBytecode,
} from '@vaimee/desmo-contracts/artifacts/contracts/DesmoHub.sol/DesmoHub.json';
import {
  abi as DesmoABI,
  bytecode as DesmoBytecode,
} from '@vaimee/desmo-contracts/artifacts/contracts/Desmo.sol/Desmo.json';
import { DesmoHub } from '@vaimee/desmo-contracts/typechain/DesmoHub';
import { Desmo as DesmoContract } from '@vaimee/desmo-contracts/typechain/Desmo';

async function getMockIExecContract(
  wallet: ethers.Wallet
): Promise<MockContract> {
  const iexecProxy = await deployMockContract(wallet, IexecProxyBuild.abi);

  /**
   * Mock viewTask
   */
  const task = {
    status: 3,
    dealid: ethers.constants.HashZero,
    idx: 0,
    timeref: 0,
    contributionDeadline: 0,
    revealDeadline: 0,
    finalDeadline: 0,
    consensusValue: ethers.constants.HashZero,
    revealCounter: 0,
    winnerCounter: 0,
    contributors: [ethers.constants.AddressZero],
    resultDigest: ethers.constants.HashZero,
    results: ethers.constants.HashZero,
    resultsTimestamp: 0,
    resultsCallback:
      '0x000000000000000000000000000000000000000000000000000000000000000b0402020202001121445c',
  };
  await iexecProxy.mock.viewTask.returns(Object.values(task));

  /**
   * Mock viewDeal
   */
  const deal = {
    app: [ethers.constants.AddressZero, ethers.constants.AddressZero, 0],
    dataset: [ethers.constants.AddressZero, ethers.constants.AddressZero, 0],
    workerpool: [ethers.constants.AddressZero, ethers.constants.AddressZero, 0],
    trust: 0,
    category: 0,
    tag: ethers.constants.HashZero,
    requester: ethers.constants.AddressZero,
    beneficiary: ethers.constants.AddressZero,
    callback: ethers.constants.AddressZero,
    params: ethers.constants.AddressZero,
    startTime: 0,
    botFirst: 0,
    botSize: 0,
    workerStake: 0,
    schedulerRewardRatio: 0,
  };
  await iexecProxy.mock.viewDeal.returns(Object.values(deal));

  return iexecProxy;
}

export async function setupMockEnvironment(): Promise<{
  account: ethers.Wallet;
  desmoHubContract: DesmoHub;
  desmoContract: ethers.Contract;
}> {
  const wallets = new MockProvider().getWallets(); // Returns 10 different wallets

  const desmoHubContractFactory = new ContractFactory(
    DesmoHubABI,
    DesmoHubBytecode,
    wallets[0]
  );
  const desmoHubContract = (await desmoHubContractFactory.deploy()) as DesmoHub;

  for (let i = 0; i < 4; i++) {
    const account = wallets[i];
    const url = `https://desmold-zion-${i + 1}.vaimee.it`;
    const tx = await desmoHubContract.connect(account).registerTDD(url, {
      from: account.address,
    });
    await tx.wait();
  }

  const iexecProxy = await getMockIExecContract(wallets[0]);
  const desmoContractFactory = new ContractFactory(
    DesmoABI,
    DesmoBytecode,
    wallets[0]
  );
  const desmoContract = await desmoContractFactory.deploy(
    desmoHubContract.address,
    iexecProxy.address
  );

  return { account: wallets[0], desmoHubContract, desmoContract };
}

export function getMockIExecSDK(
  iExec: IExec,
  wallet: ethers.Wallet,
  dAppAddress: string,
  desmo: DesmoContract
): IExec {
  /**
   * Mock orderbook.fetchAppOrderbook
   */
  iExec.orderbook.fetchAppOrderbook = async (): Promise<any> => {
    return {
      orders: [
        {
          order: {
            app: dAppAddress,
            appprice: 0,
            volume: 1000000,
            tag: '0x0000000000000000000000000000000000000000000000000000000000000000',
            datasetrestrict: '0x0000000000000000000000000000000000000000',
            workerpoolrestrict: '0x0000000000000000000000000000000000000000',
            requesterrestrict: '0x0000000000000000000000000000000000000000',
            salt: '0x968533ca0fd0b360e50d91712b741efba3e165c09dee676519c61c524ba28586',
            sign: '0x161a778689e8b818a4f3f3d4d477357bbf67b65a407d5d7910abd9ee0e5c0d063a6657711425ab0cd8ff1c1c7c4871e3bbd331353e50dfc3dd175025164b75fd1c',
          },
          orderHash:
            '0x1088b396e393845de9f8640fbdf830880a4a862a77020a538d9150bc6977409f',
          chainId: 133,
          publicationTimestamp: '2022-08-11T20:06:46.558Z',
          signer: '0x90f35F12027E4103e690dc9279E086Ef5b5431A5',
          status: 'open',
          remaining: 999970,
        },
      ],
      count: 1,
    };
  };

  /**
   * Mock orderbook.fetchWorkerpoolOrderbook
   */
  iExec.orderbook.fetchWorkerpoolOrderbook = async (): Promise<any> => {
    return {
      orders: [
        {
          order: {
            workerpool: '0x86F2102532d9d01DA8084c96c1D1Bdb90e12Bf07',
            workerpoolprice: 0,
            volume: 1,
            tag: '0x0000000000000000000000000000000000000000000000000000000000000000',
            category: 0,
            trust: 1,
            apprestrict: '0x0000000000000000000000000000000000000000',
            datasetrestrict: '0x0000000000000000000000000000000000000000',
            requesterrestrict: '0x0000000000000000000000000000000000000000',
            salt: '0x74c200c04b39951df0ccbb9b61164905a0b1d8b797c58c49a44d61315284165f',
            sign: '0x5305bbf5cc998179c8e82d6b47182ccea7f899e8c064d85ec6086965a77d506239646059745ae498638ab6c25fbcd5f72133131633a0f35c980af5fa32bb55661b',
          },
          orderHash:
            '0xf08ad8cdae8fd77de12f0a87d7255ce953ae04a24edb2d2975b143ab2b68658a',
          chainId: 133,
          publicationTimestamp: '2022-09-01T20:16:43.373Z',
          signer: '0x0B33A726ceA66A4017eE9f26568633AB0FD0Ad16',
          status: 'open',
          remaining: 1,
        },
      ],
      count: 1,
    };
  };

  /**
   * Mock wallet.getAddress
   */
  iExec.wallet.getAddress = async (): Promise<any> => wallet.address;

  /**
   * Mock order.createRequestorder
   */
  iExec.order.createRequestorder = async (): Promise<any> => {
    return {
      app: dAppAddress,
      appmaxprice: '0',
      dataset: '0x0000000000000000000000000000000000000000',
      datasetmaxprice: '0',
      workerpool: '0x0000000000000000000000000000000000000000',
      workerpoolmaxprice: '0',
      requester: wallet.address,
      beneficiary: wallet.address,
      volume: '1',
      params: {
        // eslint-disable-next-line camelcase
        iexec_args:
          '0x0000000000000000000000000000000000000000000000000000000000000005 {__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}',
      },
      callback: '0xb4E5d4772a45EeB766bb612939FE8f5128Fea531',
      category: '0',
      trust: '0',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000000',
    };
  };

  /**
   * Mock order.signRequestorder
   */
  iExec.order.signRequestorder = async (): Promise<any> => {
    return {
      params:
        '{"iexec_args":"0x0000000000000000000000000000000000000000000000000000000000000005 {__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}"}',
      callback: '0xb4E5d4772a45EeB766bb612939FE8f5128Fea531',
      beneficiary: wallet.address,
      trust: '0',
      category: '0',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000000',
      volume: '1',
      requester: wallet.address,
      workerpoolmaxprice: '0',
      workerpool: '0x0000000000000000000000000000000000000000',
      datasetmaxprice: '0',
      dataset: '0x0000000000000000000000000000000000000000',
      appmaxprice: '0',
      app: dAppAddress,
      salt: '0x5b6885ae31737a77dfc4e4a779e11976167317faa30276c6036beaa1a40af6d4',
      sign: '0xf56ecfdd56cce96a16bd368017940fd699f958f5a122ca4295aed79934f2871b6928f2cb56e18318a18b2121f896ac0c2249d3b54ffa6a9584c9934df1ff75331c',
    };
  };

  /**
   * Mock order.matchOrders
   */
  iExec.order.matchOrders = async (): Promise<any> => {
    return {
      dealid:
        '0xcf6a10ec7266f51dc4311502ec67b982551ecdb77eaaacdff2920001f5a1341f',
      volume: ethers.constants.One,
      txHash:
        '0xc60372372892b899c5ee6752c5a6a11e67b8977fda05ced357c51ba3fc536a3a',
    };
  };

  /**
   * Mock deal.show
   */
  iExec.deal.show = async (): Promise<any> => {
    return {
      dealid:
        '0x8fe9e4996bc2acc1e6e6417843ac85fb0b798af040d01570036401147374f67f',
      app: {
        pointer: dAppAddress,
        owner: '0x90f35F12027E4103e690dc9279E086Ef5b5431A5',
        price: ethers.constants.Zero,
      },
      dataset: {
        pointer: '0x0000000000000000000000000000000000000000',
        owner: '0x0000000000000000000000000000000000000000',
        price: ethers.constants.Zero,
      },
      workerpool: {
        pointer: '0x5210cD9C57546159Ac60DaC17B3e6cDF48674FBD',
        owner: '0x0B33A726ceA66A4017eE9f26568633AB0FD0Ad16',
        price: ethers.constants.Zero,
      },
      trust: ethers.constants.One,
      category: ethers.constants.Zero,
      tag: '0x0000000000000000000000000000000000000000000000000000000000000000',
      requester: wallet.address,
      beneficiary: wallet.address,
      callback: '0xb4E5d4772a45EeB766bb612939FE8f5128Fea531',
      params:
        '{"iexec_args":"0x0000000000000000000000000000000000000000000000000000000000000006 {__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}"}',
      startTime: ethers.BigNumber.from(0x631b2f93),
      botFirst: ethers.constants.Zero,
      botSize: ethers.constants.One,
      workerStake: ethers.constants.Zero,
      schedulerRewardRatio: ethers.constants.One,
      finalTime: ethers.BigNumber.from(0x631b3b4b),
      deadlineReached: false,
      tasks: [
        '0xb8d61d10ee474fe0176b3349602144e33cdd661c95c7639d463df4596bac6e0e',
      ],
    };
  };

  /**
   * Mock task.obsTask
   */
  const obsTask = new ReplaySubject<string>(4);
  obsTask.next(TaskStatus.TASK_UPDATED);
  obsTask.next(TaskStatus.TASK_UPDATED);
  obsTask.next(TaskStatus.TASK_UPDATED);
  obsTask.next(TaskStatus.TASK_COMPLETED);
  obsTask.complete();
  iExec.task.obsTask = async (): Promise<any> => {
    return {
      subscribe: (callbacks: {
        next: (data: { message: string }) => void;
        error: (error: unknown) => void;
        complete: () => void;
      }): Subscription =>
        obsTask
          .asObservable()
          .pipe(
            tap((val: string) => callbacks.next({ message: val })),
            catchError((error: unknown) => {
              callbacks.error(error);
              return of(error);
            }),
            finalize(async () => {
              callbacks.complete();
              await desmo.receiveResult(
                '0xb8d61d10ee474fe0176b3349602144e33cdd661c95c7639d463df4596bac6e0e',
                '0x00',
                {
                  gasLimit: 1000000,
                }
              );
            })
          )
          .subscribe(),
    };
  };

  return iExec;
}
