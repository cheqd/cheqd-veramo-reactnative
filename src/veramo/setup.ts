// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager } from '@veramo/core'

// Core identity manager plugin
import { AbstractIdentifierProvider, DIDManager, MemoryDIDStore } from '@veramo/did-manager'

// Core key manager plugin
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'

// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver, ResolverRegistry } from 'did-resolver'

// identity provider
import { CheqdDIDProvider, getResolver as CheqdDidResolver } from '@cheqd/did-provider-cheqd'
import { NetworkType } from '@cheqd/did-provider-cheqd/build/did-manager/cheqd-did-provider'

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IResolver>({
    plugins: [
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: {
          local: new KeyManagementSystem(
            new MemoryPrivateKeyStore()
          )
        }
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: 'did:cheqd:testnet',
        providers: {
          providerPrefix: new CheqdDIDProvider(
            {
              defaultKms: 'local',
              cosmosPayerMnemonic: process.env.REACT_APP_COSMOS_PAYER_MNEMONIC,
              networkType: NetworkType.Testnet,
              rpcUrl: process.env.REACT_APP_NETWORK_RPC_URL,
            }
          ) as AbstractIdentifierProvider
        }
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...CheqdDidResolver() as ResolverRegistry
        })
      })
    ],
  })