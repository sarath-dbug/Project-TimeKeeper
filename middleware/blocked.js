const User = require('../models/usermodel');

const checkBocked = async (req, res, next) => {


   try {

      if (req.session.user_id) {
         const userData = await User.findById({ _id: req.session.user_id })
         if (userData.is_blocked === false) {
            next();
         } else {
            res.redirect('/logout');
         }

      } else {
         next();
      }

   } catch (error) {
      console.log(error);
   }

}


module.exports = {
   checkBocked
}