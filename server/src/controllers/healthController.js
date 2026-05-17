export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Startup Validator API is running',
  })
}
