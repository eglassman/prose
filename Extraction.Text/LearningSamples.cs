using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Linq;
using Microsoft.ProgramSynthesis;
using Microsoft.ProgramSynthesis.AST;
using Microsoft.ProgramSynthesis.Extraction.Text;
using Microsoft.ProgramSynthesis.Extraction.Text.Semantics;
using Microsoft.ProgramSynthesis.VersionSpace;
using Microsoft.ProgramSynthesis.Wrangling.Constraints;


namespace Extraction.Text
{
	/// <summary>
	///     Extraction.Text learns programs to extract a single string region or a sequence of string regions from text files.
	///     This class demonstrates some common usage of Extraction.Text APIs.
	/// </summary>
	internal static class LearningSamples
	{
		
		private static void Main(string[] args)
		{
			var runD3scripts = true; //false;

			if (runD3scripts)
			{
				Console.WriteLine("running d3 scripts");

				LearnDocType();

				LearnHTMLlang();

				//LearnHead();

				LearnStyle();
				return;
				LearnMeta();
				LearnTitle();
				LearnScriptInclude();
				return;
			}
			else
			{
				Console.WriteLine("running example scripts");
				//LearnRegion();

				//LearnRegionUsingMultipleFiles();

				//LearnRegionWithNegativeExamples();

				//LearnRegionWithAdditionalReferences();

				//LearnRegionReferencingParent();

				//LearnRegionReferencingPrecedingSibling();

				//LearnRegionReferencingSucceedingSibling();

				//LearnTop3RegionPrograms();

				//LearnAllRegionPrograms();

				//SerializeProgram();

				// Learning sequence is similar to learning region. 
				// We only illustrate some API usages. Other sequence learning APIs are similar to their region APIs counterpart.
				// Note: we need to give positive examples continuously. 
				// For instance, suppose we learn a list of {A, B, C, D, E}.
				// {A, B} is a valid set of examples, while {A, C} is not.
				// In case of { A, C}, Extraction.Text assumes that B is a negative example. 
				// This helps our learning converge more quickly.
				LearnSequence();
				//LearnSequenceReferencingSibling();
				//LearnSequenceReferencingSibling_Modified();
				return;
			}

		}

		private static void LearnDocType()
		{
			Console.WriteLine("LearnDocType");

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			// Doctype
			var extractedRegion0 = input0.Slice(0, 15);
			var extractedRegion1 = input1.Slice(0, 15);

			//Console.WriteLine(extractedRegion0.ToString());
			//Console.WriteLine(extractedRegion1.ToString());

			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1) // "Leonard Robledo 75" => "Robledo"
            };

			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples);

			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg.Run(input_new);


				if (output_new != null)
				{

					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", HttpUtility.HtmlEncode(output_new), fileName, output_new.Start, output_new.End, "doctype");
					Console.WriteLine("},");
				}
				else
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": \"{2}\", \"charEnd\": \"{3}\", \"label\": \"{4}\" ", "", fileName, "", "", "doctype");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnHTMLlang()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			var extractedRegion0_b = input0.Slice(16, 32);
			var extractedRegion1_b = input1.Slice(16, 30);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());

			var examples_b = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b) // "Leonard Robledo 75" => "Robledo"
            };

			RegionProgram topRankedProg_b = RegionLearner.Instance.Learn(examples_b);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg_b.Run(input_new);

				if (output_new != null)
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", HttpUtility.HtmlEncode(output_new), fileName, output_new.Start, output_new.End, "htmllang");
					Console.WriteLine("},");
				}
				else
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": \"{2}\", \"charEnd\": \"{3}\", \"label\": \"{4}\" ", "", fileName, "", "", "htmllang");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnHead()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			var extractedRegion0_b = input0.Slice(33, 1491);
			var extractedRegion1_b = input1.Slice(31, 332);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());

			//return;

			var examples_b = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b) // "Leonard Robledo 75" => "Robledo"
            };

			//TODO: ADD NEGATIVE EXAMPLES TO TRAIN IT BETTER

			RegionProgram topRankedProg_b = RegionLearner.Instance.Learn(examples_b);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg_b.Run(input_new);
				var extracted = "";
				if (output_new != null)
				{
					var output_new_escaped = HttpUtility.HtmlEncode(output_new);
					//from http://stackoverflow.com/questions/1547476/easiest-way-to-split-a-string-on-newlines-in-net
					var output_new_string = output_new_escaped.ToString();
					//Console.WriteLine(output_new_string);
					//return;
					string[] lines = output_new_string.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);
					if (lines.Length > 1)
					{
						//Console.WriteLine("help");
						//foreach (string l in lines)
						//{
						//	Console.WriteLine(l);
						//}
						//Console.WriteLine(string.Join("\\n", lines));
						extracted = string.Join("\\n", lines);
					}
					else
					{
						extracted = output_new_string;
					}

					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", extracted, fileName, output_new.Start, output_new.End, "head");
					Console.WriteLine("},");
				}
				else
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": \"{2}\", \"charEnd\": \"{3}\", \"label\": \"{4}\" ", "", fileName, "", "", "head");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnStyle()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			var extractedRegion0_b = input0.Slice(173, 1482);
			var extractedRegion1_b = input1.Slice(345, 380);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());

			//return;

			var examples_b = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b) // "Leonard Robledo 75" => "Robledo"
            };

			//TODO: ADD NEGATIVE EXAMPLES TO TRAIN IT BETTER

			RegionProgram topRankedProg_b = RegionLearner.Instance.Learn(examples_b);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg_b.Run(input_new);
				var extracted = "";
				if (output_new != null)
				{
					var output_new_escaped = HttpUtility.HtmlEncode(output_new);
					//from http://stackoverflow.com/questions/1547476/easiest-way-to-split-a-string-on-newlines-in-net
					var output_new_string = output_new_escaped.ToString();
					//Console.WriteLine(output_new_string);
					//return;
					string[] lines = output_new_string.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);
					if (lines.Length > 1)
					{
						//Console.WriteLine("help");
						//foreach (string l in lines)
						//{
						//	Console.WriteLine(l);
						//}
						//Console.WriteLine(string.Join("\\n", lines));
						extracted = string.Join("\\n", lines);
					}
					else
					{
						extracted = output_new_string;
					}

					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", extracted, fileName, output_new.Start, output_new.End, "style");
					Console.WriteLine("},");
				}
				else
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"extracted\": \"{0}\", \"filename\": \"{1}\", \"charStart\": \"{2}\", \"charEnd\": \"{3}\", \"label\": \"{4}\" ", "", fileName, "", "", "style");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnMeta()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			var extractedRegion0_b = input0.Slice(43, 65);
			var extractedRegion1_b = input1.Slice(50, 70);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());

			//return;

			var examples_b = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b) // "Leonard Robledo 75" => "Robledo"
            };


			RegionProgram topRankedProg_b = RegionLearner.Instance.Learn(examples_b);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg_b.Run(input_new);

				if (output_new != null)
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", HttpUtility.HtmlEncode(output_new), fileName, output_new.Start, output_new.End, "meta");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnTitle()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);

			var extractedRegion0_b = input0.Slice(68, 98);
			var extractedRegion1_b = input1.Slice(79, 115);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());

			//return;

			var examples_b = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b) // "Leonard Robledo 75" => "Robledo"
            };


			RegionProgram topRankedProg_b = RegionLearner.Instance.Learn(examples_b);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				StringRegion output_new = topRankedProg_b.Run(input_new);

				if (output_new != null)
				{
					Console.WriteLine("{");
					Console.WriteLine(" \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", HttpUtility.HtmlEncode(output_new), fileName, output_new.Start, output_new.End, "title");
					Console.WriteLine("},");
				}
			}

			return;


		}

		private static void LearnScriptInclude()
		{

			string text0 = File.ReadAllText("training_samples/training_sample_0.html");
			string text1 = File.ReadAllText("training_samples/training_sample_1.html");
			string text2 = File.ReadAllText("training_samples/training_sample_2.html");

			var input0 = RegionLearner.CreateStringRegion(text0);
			var input1 = RegionLearner.CreateStringRegion(text1);
			var input2 = RegionLearner.CreateStringRegion(text2);

			var extractedRegion0_b = input0.Slice(107, 170);
			var extractedRegion1_b = input1.Slice(228, 320);
			var extractedRegion2_b = input2.Slice(225, 293);
			var extractedRegion3_b = input2.Slice(294, 366);
			var extractedRegion4_b = input2.Slice(367, 437);
			var extractedRegion5_b = input2.Slice(438, 511);

			//Console.WriteLine(extractedRegion0_b.ToString());
			//Console.WriteLine(extractedRegion1_b.ToString());
			//Console.WriteLine(extractedRegion2_b.ToString());
			//Console.WriteLine(extractedRegion3_b.ToString());
			//Console.WriteLine(extractedRegion4_b.ToString());
			//Console.WriteLine(extractedRegion5_b.ToString());

			//return;

			//var examples_b = new[] {
			//	new CorrespondingMemberEquals<StringRegion, StringRegion>(input0, extractedRegion0_b), // "Carrie Dodson 100" => "Dodson"
			//	new CorrespondingMemberEquals<StringRegion, StringRegion>(input1, extractedRegion1_b), // "Leonard Robledo 75" => "Robledo"
			//	new CorrespondingMemberEquals<StringRegion, StringRegion>(input2, extractedRegion2_b) // "Leonard Robledo 75" => "Robledo"
			//         };

			var spec = new[] {
				new MemberPrefix<StringRegion, StringRegion>(input0, new[] {
					extractedRegion0_b
				}),
				new MemberPrefix<StringRegion, StringRegion>(input1, new[] {
					extractedRegion1_b
				}),
				new MemberPrefix<StringRegion, StringRegion>(input2, new[] {
					extractedRegion2_b,
					extractedRegion3_b,
					extractedRegion4_b,
					extractedRegion5_b
				})
			};


			var topRankedProg_b = SequenceLearner.Instance.Learn(spec);

			if (topRankedProg_b == null)
			{
				Console.Error.WriteLine("Error: Learning prog fails!");
				return;
			}

			string[] fileEntries = Directory.GetFiles("training_samples");
			foreach (string fileName in fileEntries)
			{
				string text_new = File.ReadAllText(fileName);
				var input_new = RegionLearner.CreateStringRegion(text_new);
				var all_output_new = topRankedProg_b.Run(input_new);

				foreach (var output_new in all_output_new) {
					if (output_new != null)
					{
						Console.WriteLine("{");
						Console.WriteLine(" \"filename\": \"{1}\", \"charStart\": {2}, \"charEnd\": {3}, \"label\": \"{4}\" ", HttpUtility.HtmlEncode(output_new), fileName, output_new.Start, output_new.End, "scriptinclude");
						Console.WriteLine("},");
					}
				}

			}

			return;


		}


		/// <summary>
		///     Learns a program to extract a region with both positive and negative examples.
		///     Demonstrates the use of negative examples.
		/// </summary>
		private static void LearnRegionWithNegativeExamples()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100\nLeonard Robledo NA\nMargaret Cook 320");
			StringRegion[] records = { input.Slice(0, 17), input.Slice(18, 36), input.Slice(37, 54) };

			// Suppose we want to extract "100", "320".
			var constraints = new Constraint<IEnumerable<StringRegion>, IEnumerable<StringRegion>>[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(records[0], records[0].Slice(14, 17)), // "Carrie Dodson 100" => "100"
                new CorrespondingMemberDoesNotIntersect<StringRegion>(records[1], records[1]) // no extraction in "Leonard Robledo NA"
            };

			// Extraction.Text will find a program whose output does not OVERLAP with any of the negative examples.
			RegionProgram topRankedProg = RegionLearner.Instance.Learn(constraints);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (StringRegion record in records)
			{
				string output = topRankedProg.Run(record)?.Value ?? "null";
				Console.WriteLine("printing results of LearnRegionWithNegativeExamples");
				Console.WriteLine("\"{0}\" => \"{1}\"", record, output);
			}
		}

		/// <summary>
		///     Learns a program to extract a region and provides other references to help find the intended program.
		///     Demonstrates the use of additional references.
		/// </summary>
		private static void LearnRegionWithAdditionalReferences()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100\nLeonard Robledo 75\nMargaret Cook ***");
			StringRegion[] records = { input.Slice(0, 17), input.Slice(18, 36), input.Slice(37, 54) };

			// Suppose we want to extract "100", "75", and "***".
			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(records[0], records[0].Slice(14, 17)) // "Carrie Dodson 100" => "100"
            };

			// Additional references help Extraction.Text observe the behavior of the learnt programs on unseen data.
			// In this example, if we do not use additional references, Extraction.Text may learn a program that extracts the first number.
			// On the contrary, if other references are present, it knows that this program is not applicable on the third record "Margaret Cook ***",
			// and promotes a more applicable program.
			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples, new[] { records.Skip(1) });
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (StringRegion record in records)
			{
				string output = topRankedProg.Run(record)?.Value ?? "null";
				Console.WriteLine("printing results of LearnRegionWithAdditionalReferences");
				Console.WriteLine("\"{0}\" => \"{1}\"", record, output);
			}
		}

		/// <summary>
		///     Learns a program to extract a single region from a containing region (i.e., parent region).
		///     Demonstrates how parent referencing works.
		/// </summary>
		private static void LearnRegionReferencingParent()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320");
			StringRegion[] records = { input.Slice(0, 17), input.Slice(18, 36), input.Slice(37, 54) };

			// Suppose we want to extract the number out of a record
			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(records[0], records[0].Slice(14, 17)), // "Carrie Dodson 100" => "100"
                new CorrespondingMemberEquals<StringRegion, StringRegion>(records[1], records[1].Slice(34, 36)) // "Leonard Robledo 75" => "75"
            };

			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (StringRegion record in records)
			{
				string output = topRankedProg.Run(record)?.Value ?? "null";
				Console.WriteLine("printing results of LearnRegionReferencingParent");
				Console.WriteLine("\"{0}\" => \"{1}\"", record, output);
			}
		}

		/// <summary>
		///     Learns a program to extract a single region using another region that appears before it as reference (i.e.,
		///     preceding sibling region).
		///     Demonstrates how sibling referencing works.
		/// </summary>
		private static void LearnRegionReferencingPrecedingSibling()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320");
			StringRegion[] records = { input.Slice(0, 17), input.Slice(18, 36), input.Slice(37, 54) };
			StringRegion[] firstNames = { input.Slice(0, 6), input.Slice(18, 25), input.Slice(37, 45) };

			// Suppose we want to extract the number w.r.t the first name
			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(firstNames[0], records[0].Slice(14, 17)), // "Carrie" => "100"
                new CorrespondingMemberEquals<StringRegion, StringRegion>(firstNames[1], records[1].Slice(34, 36)) // "Leonard" => "75"
            };

			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (StringRegion firstName in firstNames)
			{
				string output = topRankedProg.Run(firstName)?.Value ?? "null";
				Console.WriteLine("printing results of LearnRegionReferencingPrecedingSibling");
				Console.WriteLine("\"{0}\" => \"{1}\"", firstName, output);
			}
		}

		/// <summary>
		///     Learns a program to extract a single region using another region that appears after it as reference (i.e.,
		///     succeeding sibling region).
		///     Demonstrates how sibling referencing works.
		/// </summary>
		private static void LearnRegionReferencingSucceedingSibling()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320");
			StringRegion[] records = { input.Slice(0, 17), input.Slice(18, 36), input.Slice(37, 54) };
			StringRegion[] numbers = { input.Slice(14, 17), input.Slice(34, 36), input.Slice(51, 54) };

			// Suppose we want to extract the first name w.r.t the number
			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(numbers[0], records[0].Slice(0, 6)), // "Carrie" => "100"
                new CorrespondingMemberEquals<StringRegion, StringRegion>(numbers[1], records[1].Slice(18, 25)) // "Leonard" => "75"
            };

			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (StringRegion number in numbers)
			{
				string output = topRankedProg.Run(number)?.Value ?? "null";
				Console.WriteLine("printing results of LearnRegionReferencingSucceedingSibling");
				Console.WriteLine("\"{0}\" => \"{1}\"", number, output);
			}
		}

		/// <summary>
		///     Learns top-ranked 3 region programs.
		///     Demonstrates access to lower-ranked programs.
		/// </summary>
		private static void LearnTop3RegionPrograms()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100");

			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input, input.Slice(14, 17)) // "Carrie Dodson 100" => "Dodson"
            };

			IEnumerable<RegionProgram> topKPrograms = RegionLearner.Instance.LearnTopK(examples, 3);

			var i = 0;
			StringRegion[] otherInputs = {
				input, RegionLearner.CreateStringRegion("Leonard Robledo NA"),
				RegionLearner.CreateStringRegion("Margaret Cook 320")
			};
			foreach (var prog in topKPrograms)
			{
				Console.WriteLine("Program {0}:", ++i);
				foreach (var str in otherInputs)
				{
					var r = prog.Run(str);
					Console.WriteLine("printing results of LearnTop3RegionPrograms");
					Console.WriteLine(r != null ? r.Value : "null");
				}
			}
		}


		/// <summary>
		///     Learns all region programs that satisfy the examples (advanced feature).
		///     Demonstrates access to the entire program set.
		/// </summary>
		private static void LearnAllRegionPrograms()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100");

			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input, input.Slice(14, 17)) // "Carrie Dodson 100" => "Dodson"
            };

			ProgramSet allPrograms = RegionLearner.Instance.LearnAll(examples);
			IEnumerable<ProgramNode> topKPrograms =
				allPrograms.TopK(RegionLearner.Instance.ScoreFeature, 3); // "Score" is the ranking feature

			var i = 0;
			StringRegion[] otherInputs = {
				input, RegionLearner.CreateStringRegion("Leonard Robledo NA"),
				RegionLearner.CreateStringRegion("Margaret Cook 320")
			};
			foreach (var prog in topKPrograms)
			{
				Console.WriteLine("Program {0}:", ++i);
				foreach (var str in otherInputs)
				{
					State inputState = State.Create(Language.Grammar.InputSymbol, str); // Create Microsoft.ProgramSynthesis input state
					object r = prog.Invoke(inputState); // Invoke Microsoft.ProgramSynthesis program node on the input state
					Console.WriteLine("printing results of LearnAllRegionPrograms");
					Console.WriteLine(r != null ? (r as StringRegion).Value : "null");
				}
			}
		}


		/// <summary>
		///     Learns to serialize and deserialize Extraction.Text program.
		/// </summary>
		private static void SerializeProgram()
		{
			var input = RegionLearner.CreateStringRegion("Carrie Dodson 100");

			var examples = new[] {
				new CorrespondingMemberEquals<StringRegion, StringRegion>(input, input.Slice(7, 13)) // "Carrie Dodson 100" => "Dodson"
            };

			RegionProgram topRankedProg = RegionLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			string serializedProgram = topRankedProg.Serialize();
			RegionProgram deserializedProgram = Loader.Instance.Region.Load(serializedProgram);
			var testInput = RegionLearner.CreateStringRegion("Leonard Robledo 75"); // expect "Robledo"
			StringRegion output = deserializedProgram.Run(testInput);
			if (output == null)
			{
				Console.Error.WriteLine("Error: Extracting fails!");
				return;
			}
			Console.WriteLine("printing results of SerializeProgram");
			Console.WriteLine("\"{0}\" => \"{1}\"", testInput, output);
		}

		/// <summary>
		///     Learns a program to extract a sequence of regions using its preceding sibling as reference.
		/// </summary>
		private static void LearnSequence()
		{
			// It is advised to learn a sequence with at least 2 examples because generalizing a sequence from a single element is hard.
			// Also, we need to give positive examples continuously (i.e., we cannot skip any example).
			var input =
				SequenceLearner.CreateStringRegion(
					"United States\nCarrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320\n" +
					"Canada\nConcetta Beck 350\nNicholas Sayers 90\nFrancis Terrill 2430\n" +
					"Great Britain\nNettie Pope 50\nMack Beeson 1070");
			// Suppose we want to extract all last names from the input string.

			Console.WriteLine("input");
			Console.WriteLine(input);

			var examples = new[] {
				new MemberPrefix<StringRegion, StringRegion>(input, new[] {
					input.Slice(14, 20), // input => "Carrie"
                    input.Slice(32, 39), // input => "Leonard"
                })
			};

			SequenceProgram topRankedProg = SequenceLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			foreach (var r in topRankedProg.Run(input))
			{
				var output = r != null ? r.Value : "null";
				Console.WriteLine("printing results of LearnSequence");
				Console.WriteLine(output);
			}
		}

		/// <summary>
		///     Learns a program to extract a sequence of regions from a file.
		/// </summary>
		private static void LearnSequenceReferencingSibling()
		{
			var input =
				SequenceLearner.CreateStringRegion(
					"United States\nCarrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320\n" +
					"Canada\nConcetta Beck 350\nNicholas Sayers 90\nFrancis Terrill 2430\n" +
					"Great Britain\nNettie Pope 50\nMack Beeson 1070");
			StringRegion[] areas = { input.Slice(0, 13), input.Slice(69, 75), input.Slice(134, 147) };

			// Suppose we want to extract all last names from the input string.
			var examples = new[] {
				new MemberPrefix<StringRegion, StringRegion>(input, new[] {
					input.Slice(14, 20), // input => "Carrie"
                    input.Slice(32, 39), // input => "Leonard"
                })
			};

			SequenceProgram topRankedProg = SequenceLearner.Instance.Learn(examples);
			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}

			Console.WriteLine("printing output");

			foreach (var a in areas
				.SelectMany(area => topRankedProg.Run(area)
													.Select(output => new { Input = area, Output = output })))
			{
				Console.WriteLine("next a");
				Console.WriteLine(a.ToString());
				var output = a.Output != null ? a.Output.Value : "null";
				Console.WriteLine("\"{0}\" => \"{1}\"", a.Input, output);
			}
		}

		/// <summary>
		///     Learns a program to extract a sequence of regions from a file.
		/// </summary>
		private static void LearnSequenceReferencingSibling_Modified()
		{
			var input =
				SequenceLearner.CreateStringRegion(
					"United States\nCarrie Dodson 100\nLeonard Robledo 75\nMargaret Cook 320\n" +
					"Canada\nConcetta Beck 350\nNicholas Sayers 90\nFrancis Terrill 2430\n" +
					"Great Britain\nNettie Pope 50\nMack Beeson 1070");
			StringRegion[] areas = { input.Slice(0, 13), input.Slice(69, 75), input.Slice(134, 147) };

			Console.WriteLine("input");
			Console.WriteLine(input);

			Console.WriteLine("areas");
			Console.WriteLine("count");
			Console.WriteLine(areas.Count());
			foreach (var a in areas)
			{
				Console.WriteLine("next area");
				Console.WriteLine(a);
			}

			// Suppose we want to extract all last names from the input string.
			var examples = new[] {
				new MemberPrefix<StringRegion, StringRegion>(input, new[] {
					input.Slice(14, 20), // input => "Carrie"
                    input.Slice(32, 39), // input => "Leonard"
                })
			};

			Console.WriteLine("examples");
			Console.WriteLine(examples.First());

			SequenceProgram topRankedProg = SequenceLearner.Instance.Learn(examples);

			//Console.WriteLine("top ranked program, described");
			//Console.WriteLine(topRankedProg.Describe());
			Console.WriteLine("top ranked program, to string");
			Console.WriteLine(topRankedProg.ToString());

			if (topRankedProg == null)
			{
				Console.Error.WriteLine("Error: Learning fails!");
				return;
			}
		

			foreach (var a in topRankedProg.Run(areas))
			{
				Console.WriteLine("a");
				Console.WriteLine(a);
				Console.WriteLine(a);
				//var output = a.Output != null ? a.Output.Value : "null";
				//Console.WriteLine("printing results of LearnSequenceReferencingSibling");
				//Console.WriteLine("\"{0}\" => \"{1}\"", a.Input, output);
			}
		}
	}
}
