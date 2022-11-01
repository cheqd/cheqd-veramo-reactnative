// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager, ICredentialIssuer } from '@veramo/core'

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
import { CredentialIssuerLD, ICredentialIssuerLD, LdDefaultContexts, VeramoEd25519Signature2020 } from '@veramo/credential-ld'
import { CredentialPlugin } from '@veramo/credential-w3c'
const providerPrefix = 'did:cheqd:testnet'
export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialIssuerLD & ICredentialIssuer>({
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
        defaultProvider: providerPrefix,
        providers: {
          'did:cheqd:testnet': new CheqdDIDProvider(
            {
              defaultKms: 'local',
              cosmosPayerMnemonic: 'sketch mountain erode window enact net enrich smoke claim kangaroo another visual write meat latin bacon pulp similar forum guilt father state erase bright',
              networkType: NetworkType.Testnet,
              rpcUrl: 'https://rpc.cheqd.network',
            }
          ) as AbstractIdentifierProvider
        }
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...CheqdDidResolver() as ResolverRegistry
        })
      }),
      new CredentialPlugin(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts],
        suites: [new VeramoEd25519Signature2020()]
      })
    ],
  })