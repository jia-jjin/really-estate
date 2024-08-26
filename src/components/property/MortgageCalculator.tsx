import { Button, Input } from "@nextui-org/react"
import { useEffect, useState } from "react"

const MortgageCalculator = ({ initialPropertyPrice, initialLoanAmount }: any) => {
    const [propertyPrice, setPropertyPrice] = useState<any>(initialPropertyPrice)
    const [loanAmount, setLoanAmount] = useState((initialLoanAmount))
    const [loanAmountPercentage, setLoanAmountPercentage] = useState(90)
    const [interestRate, setInterestRate] = useState(5)
    const [loanTenure, setLoanTenure] = useState(30)

    const [monthlyPayment, setMonthlyPayment] = useState<any>(Math.round((loanAmount * (interestRate / 100 / 12))
        /
        (1 - (1 + (interestRate / 100 / 12)) ** (-12 * loanTenure))))
    const [monthlyInterest, setMonthlyInterest] = useState((loanAmount * (interestRate / 100 / 12)))
    const [downpayment, setDownpayment] = useState(propertyPrice - loanAmount)
    const [downpaymentLoanPayment, setDownpaymentLoanPayment] = useState(loanAmount)

    const onPropertyPriceChangeHandler = (e: any) => {
        setPropertyPrice(e.target.value.toLocaleString())
        setLoanAmount(Math.round((e.target.value) * (loanAmountPercentage / 100)))
    }

    const onLoanAmountChangeHandler = (e: any) => {
        if (e.target.value < propertyPrice * 0.9) {
            setLoanAmount(e.target.value)
            setLoanAmountPercentage(parseFloat(((e.target.value / propertyPrice) * 100).toFixed(1)))
        }
    }

    const onLoanPercentageChangeHandler = (e: any) => {
        if (e.target.value <= 90 && e.target.value >= 1) {
            setLoanAmountPercentage(e.target.value)
            setLoanAmount(Math.round(propertyPrice * (e.target.value / 100)))
        }
    }

    const onInterestRateChangeHandler = (e: any) => {
        if (e.target.value <= 10 && e.target.value >= 2) {
            setInterestRate(e.target.value)
        }
    }

    const onLoanTenureChangeHandler = (e: any) => {
        if (e.target.value <= 35 && e.target.value >= 5) {
            setLoanTenure(e.target.value)
        }
    }

    const onCalculateLoanHandler = (e: any) => {
        e.preventDefault()
        const monthlyRepayment =
            (loanAmount * (interestRate / 100 / 12))
            /
            (1 - (1 + (interestRate / 100 / 12)) ** (-12 * loanTenure))
        setMonthlyPayment(Math.round(monthlyRepayment))
        setDownpayment(propertyPrice - loanAmount)
        setDownpaymentLoanPayment(parseFloat(loanAmount))
        setMonthlyInterest((loanAmount * (interestRate / 100 / 12)))
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Estimated mortgage</h1>
            <div className="flex gap-4 mt-6 min-h-[400px] md:h-[400px] md:flex-row flex-col">
                <div className="size-full flex-col flex border-gray-400 border rounded-md px-6">
                    <div className="h-full py-6">
                        <h1 className="font-semibold text-lg">Mortgage Breakdown</h1>
                        <div className="flex justify-between mt-2">
                            <p className="text-sm">Est. Monthly Payment</p>
                            <h1 className="font-semibold text-lg">RM {monthlyPayment.toLocaleString()} / mo</h1>
                        </div>
                        <div className="mt-2 h-[25px] w-full gap-[1.5px] flex">
                            <div style={{ width: Math.round(((monthlyPayment - monthlyInterest) / monthlyPayment) * 100) + "%" }} className={`duration-200 rounded-s-full h-full bg-cyan-600 justify-center text-white text-sm flex items-center`}>{Math.round(((monthlyPayment - monthlyInterest) / monthlyPayment) * 100)}%</div>
                            <div style={{ width: Math.round((monthlyInterest / monthlyPayment) * 100) + "%" }} className={`duration-200 rounded-e-full h-full bg-cyan-800 justify-center text-white text-sm flex items-center`}>{Math.round(((monthlyInterest) / monthlyPayment) * 100)}%</div>
                        </div>
                        <div className="sm:flex-row flex-col flex sm:gap-20 gap-0 mt-2">
                            <div className="flex items-center gap-1">
                                <span className="text-cyan-600 text-2xl">•</span>
                                <h1 className="text-sm text-gray-700 mt-1">RM {Math.round(monthlyPayment - monthlyInterest).toLocaleString()} Principal</h1>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-cyan-800 text-2xl">•</span>
                                <h1 className="text-sm text-gray-700 mt-1">RM {Math.round(monthlyInterest).toLocaleString()} Interest</h1>
                            </div>
                        </div>
                    </div>
                    <div className="h-full border-t border-gray-300 py-6">
                        <h1 className="font-semibold text-lg">Upfront Costs</h1>
                        <div className="flex justify-between mt-2">
                            <p className="text-sm">Total Downpayment</p>
                            <h1 className="font-semibold text-lg">RM {(downpayment).toLocaleString()}</h1>
                        </div>
                        <div className="mt-2 h-[25px] w-full gap-[1.5px] flex">
                            <div style={{ width: Math.round((downpayment / (downpayment + downpaymentLoanPayment)) * 100) + "%" }} className={`duration-200 rounded-s-full h-full bg-cyan-600 justify-center text-white text-sm flex items-center`}>{Math.round((downpayment / (downpayment + downpaymentLoanPayment)) * 100)}%</div>
                            <div style={{ width: Math.round((downpaymentLoanPayment / (downpayment + downpaymentLoanPayment)) * 100) + "%" }} className={`duration-200 min-w-2 rounded-e-full h-full bg-cyan-800 justify-center text-white text-sm flex items-center`}>{Math.round((downpaymentLoanPayment / (downpayment + downpaymentLoanPayment)) * 100)}%</div>
                        </div>
                        <div className="sm:flex-row flex-col flex sm:gap-20 gap-0 items-start mt-2">
                            <div className="flex items-center gap-1">
                                <span className="text-cyan-600 text-2xl">•</span>
                                <h1 className="text-sm text-gray-700 mt-1">Downpayment</h1>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-cyan-800 text-2xl">•</span>
                                <h1 className="text-sm text-gray-700 mt-1">RM {Math.round(downpaymentLoanPayment).toLocaleString()} Loan Amount</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="size-full p-4">
                    <form onSubmit={onCalculateLoanHandler}>
                        <Input
                            radius="full"
                            type="number"
                            labelPlacement="outside"
                            variant="faded"
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-600 text-small">RM</span>
                                </div>
                            }
                            label="Property Price"
                            value={propertyPrice}
                            onChange={onPropertyPriceChangeHandler}
                        />
                        <div className="flex gap-4 mt-6">
                            <Input
                                radius="full"
                                type="number"
                                onChange={onLoanAmountChangeHandler}
                                labelPlacement="outside"
                                variant="faded"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-600 text-small">RM</span>
                                    </div>
                                }
                                label="Loan Amount"
                                description="<90% of Property Price"
                                value={loanAmount.toString()}
                            />
                            <Input
                                onChange={onLoanPercentageChangeHandler}
                                radius="full"
                                type="number"
                                labelPlacement="outside"
                                variant="faded"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-600 text-small">%</span>
                                    </div>
                                }
                                label="Loan Percentage"
                                description="From 1% to 90%"
                                value={(loanAmountPercentage).toString()}
                            />
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Input
                                onChange={onInterestRateChangeHandler}
                                radius="full"
                                type="number"
                                labelPlacement="outside"
                                variant="faded"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-600 text-small">%</span>
                                    </div>
                                }
                                label="Interest Rate"
                                min={2}
                                max={10}
                                description="From 2% to 10%"
                                value={interestRate.toString()}
                            />
                            <Input
                                onChange={onLoanTenureChangeHandler}
                                radius="full"
                                type="number"
                                labelPlacement="outside"
                                variant="faded"
                                min={5}
                                max={35}
                                description="From 5 to 35 years"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-600 text-small">Yrs</span>
                                    </div>
                                }
                                label="Loan Tenure"
                                value={(loanTenure).toString()}
                            />
                        </div>
                        <Button type="submit" color="secondary" radius="full" className="w-full mt-8">Calculate</Button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default MortgageCalculator