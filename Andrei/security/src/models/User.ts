interface User extends Express.User {
  id: string;
  email: string;
  imgUrl: string;
}

export default User;