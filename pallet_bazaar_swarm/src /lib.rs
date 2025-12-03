#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        pallet_prelude::*,
        traits::{Currency, ExistenceRequirement::KeepAlive},
    };
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    pub type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The currency mechanism.
        type Currency: Currency<Self::AccountId>;
    }

    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, Default)]
    pub struct WorkerInfo<Balance> {
        pub wage_per_hour: Balance,
        pub hours_worked: u32,
        pub pto_taken: u32,
        pub pto_allowed: u32,
    }

    #[pallet::storage]
    #[pallet::getter(fn worker_info)]
    pub type Workers<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, WorkerInfo<BalanceOf<T>>, ValueQuery>;

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Register a new worker with wage and PTO
        #[pallet::weight(10_000)]
        pub fn register_worker(
            origin: OriginFor<T>,
            wage_per_hour: BalanceOf<T>,
            pto_allowed: u32,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let info = WorkerInfo {
                wage_per_hour,
                hours_worked: 0,
                pto_taken: 0,
                pto_allowed,
            };
            <Workers<T>>::insert(&who, info);
            Ok(())
        }

        /// Log hours worked
        #[pallet::weight(10_000)]
        pub fn log_hours(origin: OriginFor<T>, hours: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Workers::<T>::try_mutate(&who, |info| -> DispatchResult {
                info.hours_worked = info.hours_worked.saturating_add(hours);
                Ok(())
            })?;
            Ok(())
        }

        /// Take PTO
        #[pallet::weight(10_000)]
        pub fn take_pto(origin: OriginFor<T>, hours: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Workers::<T>::try_mutate(&who, |info| -> DispatchResult {
                ensure!(
                    info.pto_taken + hours <= info.pto_allowed,
                    "Not enough PTO remaining"
                );
                info.pto_taken += hours;
                Ok(())
            })?;
            Ok(())
        }

        /// Pay worker
        #[pallet::weight(10_000)]
        pub fn pay_worker(origin: OriginFor<T>, to: T::AccountId) -> DispatchResult {
            let _ = ensure_signed(origin)?;
            Workers::<T>::try_mutate(&to, |info| -> DispatchResult {
                let amount = info.wage_per_hour * info.hours_worked.into();
                T::Currency::deposit_creating(&to, amount);
                info.hours_worked = 0;
                Ok(())
            })?;
            Ok(())
        }
    }

    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        pub initial_workers: Vec<(T::AccountId, BalanceOf<T>, u32)>,
    }

    #[cfg(feature = "std")]
    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            Self {
                initial_workers: vec![],
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
        fn build(&self) {
            for (acct, wage, pto) in &self.initial_workers {
                Workers::<T>::insert(acct, WorkerInfo {
                    wage_per_hour: *wage,
                    hours_worked: 0,
                    pto_taken: 0,
                    pto_allowed: *pto,
                });
            }
        }
    }
}
