#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
    dispatch::DispatchResult, pallet_prelude::*, traits::Currency, transactional,
};
use frame_system::{pallet_prelude::*, offchain::SendTransactionTypes};
use sp_std::vec::Vec;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    pub type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[pallet::config]
    pub trait Config: frame_system::Config + SendTransactionTypes<Call<Self>> {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: Currency<Self::AccountId>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub(super) type Payments<T: Config> =
        StorageMap<_, Blake2_128Concat, Vec<u8>, (T::AccountId, BalanceOf<T>, bool), OptionQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentAuthorized(T::AccountId, Vec<u8>, BalanceOf<T>, bool),
        PaymentSettled(T::AccountId, Vec<u8>),
    }

    #[pallet::error]
    pub enum Error<T> {
        AlreadyPaid,
        InvalidPayment,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Authorize a payment (can be offline)
        #[pallet::weight(10_000)]
        #[transactional]
        pub fn authorize_payment(
            origin: OriginFor<T>,
            resource: Vec<u8>,
            amount: BalanceOf<T>,
            offline: bool,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(Payments::<T>::get(&resource).is_none(), Error::<T>::AlreadyPaid);
            Payments::<T>::insert(&resource, (who.clone(), amount, offline));
            Self::deposit_event(Event::PaymentAuthorized(who, resource, amount, offline));
            Ok(())
        }

        /// Settle offline pending payment
        #[pallet::weight(10_000)]
        #[transactional]
        pub fn settle_pending(origin: OriginFor<T>, resource: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            if let Some((payer, amount, offline)) = Payments::<T>::get(&resource) {
                ensure!(offline, Error::<T>::InvalidPayment);
                Payments::<T>::insert(&resource, (payer.clone(), amount, false));
                Self::deposit_event(Event::PaymentSettled(who, resource));
                Ok(())
            } else {
                Err(Error::<T>::InvalidPayment.into())
            }
        }
    }

    // Off-chain worker: read ledger & submit pending payments
    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        fn offchain_worker(_block_number: T::BlockNumber) {
            // pseudo-code: read offline_payments.json & submit authorize_payment
            // This demonstrates OOO handoff in Polkadot
        }
    }
}
