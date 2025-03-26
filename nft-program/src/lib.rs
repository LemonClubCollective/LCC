use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    program::{invoke_signed},
    system_instruction,
    rent::Rent,
    sysvar::Sysvar,
    program_pack::Pack, // Added for Mint::LEN
};
use spl_token::{
    instruction::{initialize_mint, mint_to},
    state::Mint,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?; // User wallet (Phantom)
    let mint = next_account_info(accounts_iter)?; // New mint account
    let token_program = next_account_info(accounts_iter)?; // SPL Token program
    let system_program = next_account_info(accounts_iter)?; // System program
    let rent_sysvar = next_account_info(accounts_iter)?; // Rent sysvar

    if !payer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create mint account
    let mint_rent = Rent::get()?.minimum_balance(Mint::LEN);
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            mint.key,
            mint_rent,
            Mint::LEN as u64,
            &spl_token::id(),
        ),
        &[payer.clone(), mint.clone(), system_program.clone()],
        &[],
    )?;

    // Initialize mint (0 decimals = NFT)
    invoke_signed(
        &initialize_mint(
            &spl_token::id(),
            mint.key,
            payer.key,
            Some(payer.key), // Payer as freeze authority
            0, // NFT (no decimals)
        )?,
        &[mint.clone(), rent_sysvar.clone(), token_program.clone()],
        &[],
    )?;

    msg!("Created NFT mint: {}", mint.key);
    Ok(())
}