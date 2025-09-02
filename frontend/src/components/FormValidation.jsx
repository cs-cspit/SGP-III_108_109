import * as Yup from 'yup'


export const FormValidation = Yup.object({
    email: Yup.string().email("Please enter valid email").required("Please enter your email id"),
    password: Yup.string().min(5).required("Pls enter a password"),
    cpassword: Yup.string().oneOf([Yup.ref("password")], "password is not matching")
})