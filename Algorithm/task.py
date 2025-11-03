def coin_change_greedy():
    """
    Implements the Greedy algorithm for the Coin Change Problem.
    """

    while True:
        try:
            amount = int(input("Enter the amount of money: "))
            if amount < 0:
                print("Amount must be non-negative. Try again.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter an integer for the amount.")

    while True:
        coins_input = input("Input list of values coins (e.g., 1000 500 200 100 50): ")
        try:
           
            coins = [int(c) for c in coins_input.split()]
            if not all(c > 0 for c in coins):
                print("All coin values must be positive. Try again.")
                continue
            break
        except ValueError:
            print("Invalid input. Please ensure all coin values are integers separated by spaces.")
            

    coins.sort(reverse=True)
    
    remaining_amount = amount
    combination_coins = {}
    total_coins = 0
    

    for coin in coins:
        if remaining_amount >= coin:
          
            count = remaining_amount // coin
            if count > 0:
                combination_coins[coin] = count
                remaining_amount -= count * coin
                total_coins += count
        

        if remaining_amount == 0:
            break

    print("\n--- Results ---")
    if remaining_amount == 0:
        print("Combination coins used:")

        for coin in coins:
            if coin in combination_coins:
                print(f"  {coin}: {combination_coins[coin]} coins")
        
        print(f"\nTotal number of coins: **{total_coins}**")
    else:
        print(f"The exact amount **{amount}** cannot be formed with the given coins. Remaining amount: {remaining_amount}")


coin_change_greedy()