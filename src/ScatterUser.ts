import { Api, JsonRpc } from 'eosjs'
import * as ecc from 'eosjs-ecc'
import { convertLegacyPublicKeys } from 'eosjs/dist/eosjs-numeric';
import { Chain, SignTransactionResponse, UALErrorType, User } from 'universal-authenticator-library'
import { UALScatterError } from './UALScatterError'
import { Cosigner } from './interfaces'


class CosignAuthorityProvider {
  private rpc: JsonRpc
  private cosigner: string
  private per: string

  constructor(rpc: JsonRpc, cosigner: string, per: string) {
    this.rpc = rpc
    this.cosigner = cosigner;
    this.per = per
  }

  async getRequiredKeys(args) {
    const { transaction } = args;

    transaction.actions.forEach((action, ti) => {
      action.authorization.forEach((auth) => {
        if (
          auth.actor === this.cosigner
          && auth.permission === this.per
        ) {
          delete transaction.actions[ti].authorization;
        }
      })
    });

    return convertLegacyPublicKeys((await this.rpc.fetch('/v1/chain/get_required_keys', {
      transaction,
      available_keys: args.availableKeys,
    })).required_keys);
  }
}


export class ScatterUser extends User {
  private api: Api
  private rpc: JsonRpc

  private keys: string[] = []
  private accountName: string = ''

  constructor(
    private chain: Chain,
    private scatter: any,
    private cosigner: Cosigner,
  ) {
    super()
    const rpcEndpoint = this.chain.rpcEndpoints[0]
    const rpcEndpointString = this.buildRpcEndpoint(rpcEndpoint)
    this.rpc = new JsonRpc(rpcEndpointString)
    const network = {
      blockchain: 'eos',
      chainId: this.chain.chainId,
      protocol: rpcEndpoint.protocol,
      host: rpcEndpoint.host,
      port: rpcEndpoint.port,
    }
    const rpc = this.rpc
    this.api = this.scatter.eos(network, Api, { rpc, beta3: true });

    if (this.cosigner)
      this.api.authorityProvider = new CosignAuthorityProvider(this.rpc, this.cosigner.cosigner, this.cosigner.permission);
  }

  public async signTransaction(
    transaction: any,
    { broadcast = true, blocksBehind = 3, expireSeconds = 30 }
  ): Promise<SignTransactionResponse> {
    try {
      const completedTransaction = await this.api.transact(
        transaction,
        { broadcast, blocksBehind, expireSeconds }
      )
      return this.returnEosjsTransaction(broadcast, completedTransaction)
    } catch (e) {
      throw new UALScatterError(
        'Unable to sign the given transaction',
        UALErrorType.Signing,
        e)
    }
  }

  public async verifyKeyOwnership(challenge: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('verifyKeyOwnership failed'))
      }, 1000)

      this.scatter.authenticate(challenge).then(async (signature) => {
        const pubKey = ecc.recover(signature, challenge)
        const myKeys = await this.getKeys()
        for (const key of myKeys) {
          if (key === pubKey) {
            resolve(true)
          }
        }
        resolve(false)
      })
    })
  }

  public async signArbitrary(publicKey: string, data: string, _: string): Promise<string> {
    return this.scatter.getArbitrarySignature(publicKey, data)
  }

  public async getAccountName(): Promise<string> {
    if (!this.accountName) {
      await this.refreshIdentity()
    }

    return this.accountName
  }

  public async getChainId(): Promise<string> {
    return this.chain.chainId
  }

  public async getKeys(): Promise<string[]> {
    if (!this.keys || this.keys.length === 0) {
      await this.refreshIdentity()
    }

    return this.keys
  }

  private async refreshIdentity() {
    const rpcEndpoint = this.chain.rpcEndpoints[0]
    try {
      const identity = await this.scatter.getIdentity({
        accounts: [{
          blockchain: 'eos',
          host: rpcEndpoint.host,
          port: rpcEndpoint.port,
          chainId: this.chain.chainId
        }]
      })

      this.keys = [identity.accounts[0].publicKey]
      this.accountName = identity.accounts[0].name
    } catch (e) {
      throw new UALScatterError(
        'Unable load user\'s identity',
        UALErrorType.DataRequest,
        e)
    }
  }
}
