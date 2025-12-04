use super::*;
use frame_benchmarking::{benchmarks, whitelisted_caller};
use frame_system::RawOrigin;

benchmarks! {
    authorize_payment {
        let caller = whitelisted_caller::<T>();
        let resource = b"test_resource".to_vec();
        let amount = 10_000u32.into();
    }: _(RawOrigin::Signed(caller), resource.clone(), amount, false)
    verify {
        let storage = Payments::<T>::get(&b"test_resource".to_vec());
    }

    settle_pending {
        let caller = whitelisted_caller::<T>();
        let resource = b"test_resource".to_vec();
        let amount = 10_000u32.into();
        Payments::<T>::insert(&resource, (caller.clone(), amount, true));
    }: _(RawOrigin::Signed(caller), resource.clone())
    verify {
        let storage = Payments::<T>::get(&resource);
        assert!(!storage.unwrap().2);
    }
}

