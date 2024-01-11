using Microsoft.AspNetCore.Mvc;

namespace Wordle.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class WordleGameController : ControllerBase
{
    [HttpGet(Name = "GetWordleAnswer")]
    public string GetWordleAnswer()
    {
        return "LOVEN";
    }
}
