import { useEffect, useState } from 'react'
import { useConnect, useAccount } from 'wagmi'

type props = {
  setShowAuthModal: (status: boolean) => void
}

export default function AuthModal(props: props) {
  const { setShowAuthModal } = props;
  const [showConnector, setShowConnector] = useState(false)
  const { isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()

  useEffect(() => {
    if (isConnected) {
      setShowAuthModal(false);
    }
  }, [isConnected]);

  const connectWallet = () => {
    setShowConnector(true)
  }

  return (

    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex flex-col min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

        <div>

          <div className="mt-3 text-center sm:mt-5">
            <h3
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Connect Your Farcaster Account
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                In order to post new videos or interact with existing videos on Absorb, you must have a Farcaster account. Connect your wallet to begin.
              </p>
            </div>
          </div>
        </div>
        {!showConnector && (
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              onClick={connectWallet}
              type="button"              
            >
              Connect Wallet
            </button>
            <button
              type="button"              
              onClick={() => setShowAuthModal(false)}   
            >
              Cancel
            </button>
          </div>
        )}

        {showConnector && (
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            {connectors.map((connector) => (
              <button
                disabled={!connector.ready}
                key={connector.id}
                type="button"                
                onClick={() => connect({ connector })}
              >
                {connector.name}
                {!connector.ready && ' (unsupported)'}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  ' (connecting)'}
              </button>
            ))}
            <button
              type="button"              
              onClick={() => setShowAuthModal(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
