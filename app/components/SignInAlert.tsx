import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { signIn } from "next-auth/react";
  
  interface SignInAlertProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const SignInAlert: React.FC<SignInAlertProps> = ({ isOpen, setIsOpen }) => {
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-[60vh] max-w-[80vw] rounded-md bg-[#0f172a] text-gray-200 border border-blue-800 shadow-lg">
          <AlertDialogHeader className="flex justify-center items-center">
            <AlertDialogTitle className="text-blue-400">
              Looks like you are not Signed In
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col items-center">
              <button
                className="px-4 py-2 flex gap-2 items-center border border-blue-600 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-150 shadow-md hover:shadow-lg my-[20px] mt-[15px]"
                onClick={() => signIn("google")}
              >
                <img
                  className="w-6 h-6"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  loading="lazy"
                  alt="Google logo"
                />
                <span>Login with Google</span>
              </button>
              <span
                className="text-blue-400 hover:text-blue-500 hover:cursor-pointer mt-[10px] text-sm border-b-2 border-blue-500 inline-block transition-all duration-150"
                onClick={() => setIsOpen(false)}
              >
                Stay Signed Out
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  export default SignInAlert;
  