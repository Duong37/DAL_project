#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod group_contract {
    #[ink(storage)]
    pub struct GroupContract {
        owner: AccountId,
        files: Vec<Hash>,
    }

    impl GroupContract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                files: Vec::new(),
            }
        }

        #[ink(message)]
        pub fn add_file(&mut self, file_hash: Hash) {
            self.files.push(file_hash);
        }

        #[ink(message)]
        pub fn get_files(&self) -> Vec<Hash> {
            self.files.clone()
        }
    }
}
